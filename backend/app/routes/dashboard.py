"""
Dashboard Route — single endpoint that returns everything the dashboard needs:
  - Portfolio summary (total value, gain/loss, allocation)
  - Goals count + active goals list
  - Recent transactions
  - All in one round-trip
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.models.portfolio import Investment, Transaction

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Single endpoint for the entire dashboard.
    Returns portfolio stats, goal counts, and recent transactions.
    """
    # ── Portfolio ─────────────────────────────────────────────────────────────
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.units   >  0,
    ).all()

    total_value      = sum(float(i.current_value or 0) for i in investments)
    total_cost       = sum(float(i.cost_basis    or 0) for i in investments)
    total_gain_loss  = total_value - total_cost
    gain_loss_pct    = round((total_gain_loss / total_cost * 100), 2) if total_cost > 0 else 0.0
    num_positions    = len(investments)

    # Allocation breakdown
    from collections import defaultdict
    ALLOC_COLORS = {
        "stock":"#a855f7", "etf":"#06b6d4",
        "mutual_fund":"#10b981", "bond":"#f59e0b", "cash":"#64748b",
    }
    buckets = defaultdict(float)
    for inv in investments:
        atype = inv.asset_type.value if hasattr(inv.asset_type, "value") else str(inv.asset_type)
        buckets[atype] += float(inv.current_value or 0)

    allocation = [
        {
            "asset_type": atype,
            "value":      round(val, 2),
            "percentage": round(val / total_value * 100, 2) if total_value > 0 else 0,
            "color":      ALLOC_COLORS.get(atype, "#94a3b8"),
        }
        for atype, val in sorted(buckets.items(), key=lambda x: -x[1])
    ]

    # Top investments (for table)
    top_investments = []
    for inv in sorted(investments, key=lambda i: float(i.current_value or 0), reverse=True)[:5]:
        cost  = float(inv.cost_basis    or 0)
        value = float(inv.current_value or 0)
        gl    = value - cost
        gl_pct = round(gl / cost * 100, 2) if cost > 0 else 0.0
        top_investments.append({
            "id":            inv.id,
            "symbol":        inv.symbol,
            "company_name":  inv.company_name,
            "units":         float(inv.units or 0),
            "avg_buy_price": float(inv.avg_buy_price or 0),
            "current_value": value,
            "cost_basis":    cost,
            "last_price":    float(inv.last_price or 0),
            "last_price_at": inv.last_price_at.isoformat() if inv.last_price_at else None,
            "gain_loss":     round(gl, 2),
            "gain_loss_pct": gl_pct,
        })

    # ── Goals ─────────────────────────────────────────────────────────────────
    all_goals    = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    active_goals = [g for g in all_goals if g.status == GoalStatus.active]
    total_goals  = len(all_goals)
    active_count = len(active_goals)

    from datetime import date
    today = date.today()

    goals_list = []
    for g in active_goals[:3]:
        target  = float(g.target_amount)
        current = float(g.current_amount)
        pct     = round((current / target * 100), 2) if target > 0 else 0.0
        months_left = None
        if g.target_date:
            months_left = max(
                (g.target_date.year - today.year) * 12 + (g.target_date.month - today.month), 0
            )
        goals_list.append({
            "id":                   g.id,
            "name":                 g.name,
            "goal_type":            g.goal_type.value if hasattr(g.goal_type, "value") else g.goal_type,
            "target_amount":        target,
            "current_amount":       current,
            "monthly_contribution": float(g.monthly_contribution or 0),
            "target_date":          str(g.target_date),
            "progress_percent":     pct,
            "months_remaining":     months_left,
            "amount_remaining":     round(max(target - current, 0), 2),
        })

    # ── Recent transactions ───────────────────────────────────────────────────
    recent_txns_raw = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.executed_at.desc())
        .limit(5)
        .all()
    )
    recent_txns = [
        {
            "id":           t.id,
            "symbol":       t.symbol,
            "type":         t.type.value if hasattr(t.type, "value") else t.type,
            "quantity":     float(t.quantity or 0),
            "price":        float(t.price    or 0),
            "fees":         float(t.fees     or 0),
            "total_amount": round(float(t.quantity or 0) * float(t.price or 0) + float(t.fees or 0), 2),
            "executed_at":  t.executed_at.isoformat() if t.executed_at else None,
        }
        for t in recent_txns_raw
    ]

    # ── Return everything ─────────────────────────────────────────────────────
    return {
        "portfolio": {
            "total_value":     round(total_value,     2),
            "total_cost":      round(total_cost,      2),
            "total_gain_loss": round(total_gain_loss, 2),
            "gain_loss_pct":   gain_loss_pct,
            "num_positions":   num_positions,
            "allocation":      allocation,
            "investments":     top_investments,
        },
        "goals": {
            "total":        total_goals,
            "active":       active_count,
            "active_list":  goals_list,
        },
        "recent_transactions": recent_txns,
        "user": {
            "name":         current_user.name,
            "risk_profile": current_user.risk_profile.value
                            if hasattr(current_user.risk_profile, "value")
                            else current_user.risk_profile,
            "kyc_status":   current_user.kyc_status.value
                            if hasattr(current_user.kyc_status, "value")
                            else current_user.kyc_status,
        },
        "generated_at": datetime.utcnow().isoformat(),
    }
