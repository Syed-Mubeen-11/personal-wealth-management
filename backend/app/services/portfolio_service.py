"""
Portfolio Service — Core Business Logic

Key principle:
  Investments table is a DERIVED VIEW of Transactions.
  Every time a transaction is added/deleted, we call
  rebuild_investment_from_transactions() to recalculate
  units, avg_buy_price, and cost_basis from scratch.

Market prices are stored in market_prices table separately.
current_value = units × last_price (from market_prices).
"""
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.portfolio import Investment, Transaction, MarketPrice, TransactionType, AssetType

ALLOCATION_COLORS = {
    "stock":       "#a855f7",
    "etf":         "#06b6d4",
    "mutual_fund": "#10b981",
    "bond":        "#f59e0b",
    "cash":        "#64748b",
}


# ── Rebuild investment from transactions (THE core function) ──────────────────

def rebuild_investment_from_transactions(
    db: Session,
    user_id: int,
    symbol: str,
) -> Optional[Investment]:
    """
    Recalculate an investment's units, avg_buy_price, and cost_basis
    by replaying all BUY and SELL transactions for that symbol.

    This is called after EVERY transaction change so investments
    always reflect the true state of transactions.

    Formula:
        For each BUY:  total_cost += qty * price; total_units += qty
        For each SELL: total_units -= qty (cost_basis reduces proportionally)
        avg_buy_price = total_cost / total_units
        cost_basis    = total_units * avg_buy_price
    """
    inv = db.query(Investment).filter(
        Investment.user_id == user_id,
        Investment.symbol  == symbol.upper(),
    ).first()

    if not inv:
        return None

    # Fetch all BUY and SELL transactions ordered by date
    txns = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.symbol  == symbol.upper(),
            Transaction.type.in_([TransactionType.buy, TransactionType.sell]),
        )
        .order_by(Transaction.executed_at.asc())
        .all()
    )

    total_units    = Decimal("0")
    total_cost     = Decimal("0")

    for txn in txns:
        qty   = Decimal(str(txn.quantity or 0))
        price = Decimal(str(txn.price    or 0))

        if txn.type == TransactionType.buy:
            total_cost  += qty * price
            total_units += qty

        elif txn.type == TransactionType.sell:
            # Reduce units; reduce cost proportionally (FIFO simplified)
            if total_units > 0:
                cost_per_unit = total_cost / total_units
                total_cost   -= qty * cost_per_unit
                total_cost    = max(total_cost, Decimal("0"))
            total_units -= qty
            total_units  = max(total_units, Decimal("0"))

    # Round
    total_units = round(total_units, 6)
    total_cost  = round(total_cost,  2)
    avg         = round(total_cost / total_units, 4) if total_units > 0 else Decimal("0")

    inv.units         = total_units
    inv.avg_buy_price = avg
    inv.cost_basis    = total_cost

    # Update current_value from market price if available
    mp = db.query(MarketPrice).filter(MarketPrice.symbol == symbol.upper()).first()
    if mp and mp.price and total_units > 0:
        inv.last_price    = mp.price
        inv.last_price_at = mp.fetched_at
        inv.current_value = round(total_units * mp.price, 2)
    else:
        inv.current_value = total_cost  # fallback: no gain/loss until price fetched

    db.commit()
    db.refresh(inv)
    return inv


# ── Get or create investment record ──────────────────────────────────────────

def get_or_create_investment(
    db: Session,
    user_id: int,
    symbol: str,
    asset_type: AssetType = AssetType.stock,
    company_name: Optional[str] = None,
) -> Investment:
    """
    Find existing investment for this user+symbol, or create a placeholder.
    The actual units/cost are always calculated from transactions.
    """
    inv = db.query(Investment).filter(
        Investment.user_id == user_id,
        Investment.symbol  == symbol.upper(),
    ).first()

    if not inv:
        inv = Investment(
            user_id      = user_id,
            symbol       = symbol.upper(),
            asset_type   = asset_type,
            company_name = company_name,
        )
        db.add(inv)
        db.flush()  # get the ID without committing

    elif company_name and not inv.company_name:
        inv.company_name = company_name

    return inv


# ── Update market prices ──────────────────────────────────────────────────────

def upsert_market_price(
    db: Session,
    symbol: str,
    price: float,
    change: float = 0,
    change_pct: float = 0,
    currency: str = "USD",
    source: str = "yfinance",
) -> MarketPrice:
    """
    Insert or update a market price in the market_prices table.
    Then sync all investments for that symbol.
    """
    mp = db.query(MarketPrice).filter(MarketPrice.symbol == symbol.upper()).first()

    if mp:
        mp.price      = Decimal(str(round(price, 4)))
        mp.change     = Decimal(str(round(change, 4)))
        mp.change_pct = Decimal(str(round(change_pct, 4)))
        mp.currency   = currency
        mp.source     = source
        mp.fetched_at = datetime.utcnow()
    else:
        mp = MarketPrice(
            symbol     = symbol.upper(),
            price      = Decimal(str(round(price, 4))),
            change     = Decimal(str(round(change, 4))),
            change_pct = Decimal(str(round(change_pct, 4))),
            currency   = currency,
            source     = source,
            fetched_at = datetime.utcnow(),
        )
        db.add(mp)

    db.flush()

    # Sync current_value for all investments of this symbol
    investments = db.query(Investment).filter(
        Investment.symbol == symbol.upper(),
        Investment.units  >  0,
    ).all()

    for inv in investments:
        inv.last_price    = mp.price
        inv.last_price_at = mp.fetched_at
        inv.current_value = round(Decimal(str(inv.units)) * mp.price, 2)

    db.commit()
    return mp


# ── Portfolio summary ─────────────────────────────────────────────────────────

def build_portfolio_summary(investments: List[Investment]) -> dict:
    """Aggregate portfolio stats across all active positions."""
    total_value      = Decimal("0")
    total_cost       = Decimal("0")
    today_change     = Decimal("0")
    type_buckets: dict[str, Decimal] = {}

    for inv in investments:
        cost  = Decimal(str(inv.cost_basis    or 0))
        value = Decimal(str(inv.current_value or 0))
        if value == 0:
            value = cost  # fallback

        total_value += value
        total_cost  += cost

        # Today's change contribution
        if inv.last_price and inv.units:
            from app.models.portfolio import MarketPrice
            # change is already in market_prices; use inv fields for simplicity
            pass

        atype = inv.asset_type.value if hasattr(inv.asset_type, "value") else str(inv.asset_type)
        type_buckets[atype] = type_buckets.get(atype, Decimal("0")) + value

    total_gl     = total_value - total_cost
    gl_pct       = float(total_gl / total_cost * 100) if total_cost > 0 else 0.0

    allocation = [
        {
            "asset_type": atype,
            "value":      float(val),
            "percentage": float(val / total_value * 100) if total_value > 0 else 0,
            "color":      ALLOCATION_COLORS.get(atype, "#94a3b8"),
        }
        for atype, val in type_buckets.items()
    ]
    allocation.sort(key=lambda x: x["value"], reverse=True)

    return {
        "total_value":      float(total_value),
        "total_cost_basis": float(total_cost),
        "total_gain_loss":  float(total_gl),
        "gain_loss_pct":    round(gl_pct, 2),
        "today_change":     0.0,   # requires per-symbol change data
        "today_change_pct": 0.0,
        "num_positions":    len(investments),
        "allocation":       allocation,
    }


# ── Gain/loss for a single investment ────────────────────────────────────────

def compute_investment_fields(inv: Investment) -> dict:
    cost  = float(inv.cost_basis    or 0)
    value = float(inv.current_value or 0)
    if value == 0:
        value = cost

    gl    = value - cost
    glpct = (gl / cost * 100) if cost > 0 else 0.0

    return {
        "gain_loss":     round(gl,    2),
        "gain_loss_pct": round(glpct, 2),
    }
