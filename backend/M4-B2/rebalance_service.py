"""
B2-1: Rebalance Computation Service
app/services/rebalance_service.py
"""
from sqlalchemy.orm import Session
from typing import Dict, List
from app.models import Investment  # adjust import to your actual models


def compute_rebalance(user_id: int, db: Session) -> dict:
    """
    Fetches the user's investments, computes current vs target allocation,
    and returns a suggestions list.

    Returns:
        {
            "currentWeights": Dict[str, float],  # keyed by asset_type
            "targetWeights":  Dict[str, float],  # keyed by asset_type
            "suggestions": [
                {
                    "action": "BUY" | "SELL",
                    "symbol": str,
                    "asset_type": str,
                    "qty_change": float,        # always positive
                    "estimated_value": float,
                    "drift_impact": float
                }
            ]
        }
    """
    # ── 1. Fetch investments ───────────────────────────────────────────────
    investments: List[Investment] = (
        db.query(Investment)
        .filter(Investment.user_id == user_id)
        .all()
    )

    if not investments:
        # Empty portfolio → suggest buying everything in target allocation
        return {
            "currentWeights": {},
            "targetWeights": _get_target_allocation(user_id, db),
            "suggestions": _all_buy_suggestions(user_id, db),
        }

    # ── 2. Compute current weights ─────────────────────────────────────────
    total_value = sum(inv.current_value for inv in investments)
    if total_value == 0:
        return {
            "currentWeights": {},
            "targetWeights": _get_target_allocation(user_id, db),
            "suggestions": [],
        }

    current_weights: Dict[str, float] = {}
    by_asset: Dict[str, List[Investment]] = {}
    for inv in investments:
        current_weights[inv.asset_type] = current_weights.get(inv.asset_type, 0.0) + (
            inv.current_value / total_value
        )
        by_asset.setdefault(inv.asset_type, []).append(inv)

    # ── 3. Get target weights (from BE-1's allocation engine) ──────────────
    target_weights: Dict[str, float] = _get_target_allocation(user_id, db)

    # ── 4. Compute suggestions ─────────────────────────────────────────────
    suggestions = []
    all_asset_types = set(list(current_weights.keys()) + list(target_weights.keys()))

    for asset_type in all_asset_types:
        current_w = current_weights.get(asset_type, 0.0)
        target_w = target_weights.get(asset_type, 0.0)
        drift = target_w - current_w          # positive = underweight, negative = overweight

        if abs(drift) < 0.005:               # ignore drifts < 0.5 %
            continue

        action = "BUY" if drift > 0 else "SELL"
        estimated_value = abs(drift) * total_value

        # Pick representative holding for this asset type
        holdings = by_asset.get(asset_type, [])
        if holdings:
            rep = holdings[0]
            price = rep.current_value / rep.quantity if rep.quantity else 1.0
            qty_change = round(estimated_value / price, 4)
            symbol = rep.symbol
        else:
            # Asset type in target but not yet held
            qty_change = 0.0
            symbol = asset_type

        suggestions.append(
            {
                "action": action,
                "symbol": symbol,
                "asset_type": asset_type,
                "qty_change": abs(qty_change),    # always positive
                "estimated_value": round(estimated_value, 2),
                "drift_impact": round(drift, 4),
            }
        )

    return {
        "currentWeights": {k: round(v, 4) for k, v in current_weights.items()},
        "targetWeights": {k: round(v, 4) for k, v in target_weights.items()},
        "suggestions": suggestions,
    }


# ── Private helpers ────────────────────────────────────────────────────────

def _get_target_allocation(user_id: int, db: Session) -> Dict[str, float]:
    """
    Delegates to BE-1's shared allocation_engine module.
    Import path: app.services.allocation_engine.get_target_allocation
    """
    from app.services.allocation_engine import get_target_allocation  # BE-1 module
    return get_target_allocation(user_id, db)


def _all_buy_suggestions(user_id: int, db: Session) -> list:
    """Returns BUY suggestions for every target asset when portfolio is empty."""
    target = _get_target_allocation(user_id, db)
    return [
        {
            "action": "BUY",
            "symbol": asset_type,
            "asset_type": asset_type,
            "qty_change": 0.0,   # no price info available for empty portfolio
            "estimated_value": 0.0,
            "drift_impact": round(weight, 4),
        }
        for asset_type, weight in target.items()
    ]
