"""
Portfolio Routes — Transactions as Source of Truth

Flow for every transaction:
  1. Record transaction in transactions table
  2. get_or_create_investment() for that symbol
  3. rebuild_investment_from_transactions() → recalculates units/avg/cost
  4. apply live market price if available

Investments table is ALWAYS derived from transactions.
You never write directly to investments.units or investments.avg_buy_price.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from datetime import datetime
import math
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.portfolio import Investment, Transaction, MarketPrice, TransactionType
from app.schemas.portfolio import (
    TransactionCreateRequest, TransactionResponse, TransactionListResponse,
    InvestmentResponse, PortfolioSummaryResponse, AllocationItem, MarketPriceResponse
)
from app.services.portfolio_service import (
    get_or_create_investment,
    rebuild_investment_from_transactions,
    build_portfolio_summary,
    compute_investment_fields,
    upsert_market_price,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def to_inv_resp(inv: Investment) -> InvestmentResponse:
    computed = compute_investment_fields(inv)
    return InvestmentResponse(
        id=inv.id, user_id=inv.user_id, asset_type=inv.asset_type,
        symbol=inv.symbol, company_name=inv.company_name,
        units=inv.units, avg_buy_price=inv.avg_buy_price,
        cost_basis=inv.cost_basis, current_value=inv.current_value,
        last_price=inv.last_price, last_price_at=inv.last_price_at,
        created_at=inv.created_at,
        gain_loss=computed["gain_loss"],
        gain_loss_pct=computed["gain_loss_pct"],
    )


def to_txn_resp(txn: Transaction) -> TransactionResponse:
    total = float(txn.quantity or 0) * float(txn.price or 0) + float(txn.fees or 0)
    return TransactionResponse(
        id=txn.id, user_id=txn.user_id, investment_id=txn.investment_id,
        symbol=txn.symbol, type=txn.type,
        quantity=txn.quantity, price=txn.price, fees=txn.fees,
        notes=txn.notes, executed_at=txn.executed_at,
        total_amount=round(total, 2),
    )


def _fetch_and_apply_live_price(db: Session, symbol: str) -> None:
    """
    Try to fetch live price from yfinance and store in market_prices table.
    Then sync all investments for that symbol.
    """
    try:
        from app.services.market_data import fetch_price
        pd = fetch_price(symbol.upper())
        if pd and pd.get("price"):
            upsert_market_price(
                db, symbol=symbol,
                price=pd["price"],
                change=pd.get("change", 0),
                change_pct=pd.get("change_pct", 0),
                currency=pd.get("currency", "USD"),
                source=pd.get("source", "yfinance"),
            )
            logger.info(f"Live price stored: {symbol} = ${pd['price']}")
    except Exception as e:
        logger.warning(f"Could not fetch live price for {symbol}: {e}")


# ── Portfolio Summary ─────────────────────────────────────────────────────────

@router.get("/summary", response_model=PortfolioSummaryResponse)
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.units   >  0,
    ).all()

    summary = build_portfolio_summary(investments)
    return PortfolioSummaryResponse(
        **{k: v for k, v in summary.items() if k != "allocation"},
        allocation=[AllocationItem(**a) for a in summary["allocation"]],
        investments=[to_inv_resp(i) for i in investments],
    )


# ── Transactions — source of truth ────────────────────────────────────────────

@router.get("/transactions", response_model=TransactionListResponse)
def list_transactions(
    page:      int          = Query(default=1, ge=1),
    page_size: int          = Query(default=10, ge=1, le=100),
    type:      Optional[str] = None,
    symbol:    Optional[str] = None,
    db:        Session      = Depends(get_db),
    current_user: User      = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if type:   q = q.filter(Transaction.type == type)
    if symbol: q = q.filter(Transaction.symbol.ilike(f"%{symbol}%"))

    total = q.count()
    txns  = q.order_by(Transaction.executed_at.desc()).offset((page-1)*page_size).limit(page_size).all()

    return TransactionListResponse(
        transactions=[to_txn_resp(t) for t in txns],
        total=total, page=page, page_size=page_size,
        total_pages=math.ceil(total/page_size) if total > 0 else 1,
    )


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(
    payload:      TransactionCreateRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    THE primary write endpoint.

    Flow:
      1. Create transaction record
      2. Ensure investment record exists for this symbol
      3. Rebuild investment from ALL transactions (recalculate units/avg/cost)
      4. Fetch live price from yfinance → store in market_prices
      5. Sync current_value to investment

    This guarantees investments always reflects the true transaction history.
    """
    symbol = payload.symbol.upper()

    # Step 1: Ensure investment record exists
    inv = get_or_create_investment(
        db, user_id=current_user.id, symbol=symbol,
        asset_type=payload.asset_type,
        company_name=payload.company_name,
    )
    db.flush()

    # Step 2: Record the transaction
    txn = Transaction(
        user_id       = current_user.id,
        investment_id = inv.id,
        symbol        = symbol,
        type          = payload.type,
        quantity      = payload.quantity or Decimal("0"),
        price         = payload.price    or Decimal("0"),
        fees          = payload.fees     or Decimal("0"),
        notes         = payload.notes,
        executed_at   = payload.executed_at or datetime.utcnow(),
    )
    db.add(txn)
    db.flush()

    # Step 3: Rebuild investment from all transactions
    rebuild_investment_from_transactions(db, current_user.id, symbol)

    # Commit transaction and investment update FIRST
    # This guarantees the transaction is saved even if yfinance fails
    db.commit()
    db.refresh(txn)

    # Step 4: Fetch live price AFTER commit — failure here won't affect the response
    if payload.type in (TransactionType.buy, TransactionType.sell):
        try:
            _fetch_and_apply_live_price(db, symbol)
        except Exception as e:
            logger.warning(f"Live price fetch failed for {symbol} (transaction still saved): {e}")

    return to_txn_resp(txn)


@router.delete("/transactions/{txn_id}", status_code=204)
def delete_transaction(
    txn_id:       int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Delete transaction and rebuild the investment from remaining transactions.
    This ensures the investment state is always consistent.
    """
    txn = db.query(Transaction).filter(
        Transaction.id      == txn_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(404, "Transaction not found")

    symbol = txn.symbol
    db.delete(txn)
    db.flush()

    # Rebuild investment from remaining transactions
    if symbol:
        rebuild_investment_from_transactions(db, current_user.id, symbol)

    db.commit()


# ── Investments — read-only derived view ─────────────────────────────────────

@router.get("/investments", response_model=list[InvestmentResponse])
def list_investments(
    asset_type:   Optional[str] = None,
    db:           Session       = Depends(get_db),
    current_user: User          = Depends(get_current_user),
):
    """
    Read-only. Investments are derived from transactions.
    To change a holding, add a transaction — not edit an investment directly.
    """
    q = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.units   >  0,
    )
    if asset_type:
        q = q.filter(Investment.asset_type == asset_type)
    return [to_inv_resp(i) for i in q.order_by(Investment.created_at.desc()).all()]


@router.get("/investments/{inv_id}", response_model=InvestmentResponse)
def get_investment(
    inv_id:       int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    inv = db.query(Investment).filter(
        Investment.id      == inv_id,
        Investment.user_id == current_user.id,
    ).first()
    if not inv:
        raise HTTPException(404, "Investment not found")
    return to_inv_resp(inv)


@router.get("/investments/{inv_id}/transactions", response_model=list[TransactionResponse])
def get_investment_transactions(
    inv_id:       int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """List all transactions for a specific investment position."""
    inv = db.query(Investment).filter(
        Investment.id      == inv_id,
        Investment.user_id == current_user.id,
    ).first()
    if not inv:
        raise HTTPException(404, "Investment not found")

    txns = db.query(Transaction).filter(
        Transaction.investment_id == inv_id
    ).order_by(Transaction.executed_at.desc()).all()
    return [to_txn_resp(t) for t in txns]


# ── Market Prices ─────────────────────────────────────────────────────────────

@router.get("/market-prices", response_model=list[MarketPriceResponse])
def list_market_prices(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """Return all stored market prices."""
    prices = db.query(MarketPrice).order_by(MarketPrice.fetched_at.desc()).all()
    return [
        MarketPriceResponse(
            symbol=p.symbol, price=float(p.price),
            change=float(p.change or 0), change_pct=float(p.change_pct or 0),
            currency=p.currency or "USD", source=p.source or "yfinance",
            fetched_at=p.fetched_at,
        )
        for p in prices
    ]


# ── Refresh live prices ───────────────────────────────────────────────────────

@router.post("/refresh-prices")
async def refresh_prices(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Refresh live prices for all user investments.
    Stores prices in market_prices table, then syncs current_value.
    """
    investments = db.query(Investment).filter(
        Investment.user_id    == current_user.id,
        Investment.asset_type != "cash",
        Investment.units      >  0,
    ).all()

    symbols = list({inv.symbol for inv in investments})
    if not symbols:
        return {"message": "No positions to refresh", "updated": 0}

    from app.services.market_data import fetch_prices_bulk
    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        price_map = await loop.run_in_executor(
            pool, lambda: fetch_prices_bulk(symbols, delay_seconds=0.2)
        )

    updated = 0
    prices_stored = {}

    for symbol, pd in price_map.items():
        if pd and pd.get("price"):
            upsert_market_price(
                db, symbol=symbol,
                price=pd["price"],
                change=pd.get("change", 0),
                change_pct=pd.get("change_pct", 0),
                currency=pd.get("currency", "USD"),
                source=pd.get("source", "yfinance"),
            )
            prices_stored[symbol] = pd["price"]
            updated += 1

    db.commit()
    return {
        "message":      f"Refreshed {updated} of {len(symbols)} positions",
        "updated":      updated,
        "prices":       prices_stored,
        "last_updated": datetime.utcnow().isoformat(),
    }
