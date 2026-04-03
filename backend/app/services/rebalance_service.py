"""
Rebalance Service — Computes current vs. target allocation delta and generates
buy/sell suggestions to bring the portfolio in line with the target.
"""

from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.portfolio import Investment, AssetType
from app.services.allocation_engine import get_target_allocation, get_current_weights, ASSET_TYPE_MAP


def compute_rebalance(user_id: int, db: Session) -> dict:
    """
    Compute rebalance suggestions for a user.

    Returns:
        {
            currentWeights: Dict[str, float],
            targetWeights:  Dict[str, float],
            suggestions:    List[SuggestionDict],
        }

    Each suggestion:
        {
            action:          "BUY" | "SELL",
            asset_class:     str,
            drift:           float,   # target - current (positive = need more)
            drift_impact:    float,   # abs drift as decimal
        }
    """
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    risk_profile = str(user.risk_profile.value if hasattr(user.risk_profile, 'value') else user.risk_profile)

    current_weights = get_current_weights(user_id, db)
    target_weights  = get_target_allocation(risk_profile)

    # Compute total portfolio value for qty/value estimates
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    total_value = sum(float(inv.current_value or inv.cost_basis or 0) for inv in investments)

    suggestions: List[dict] = []
    threshold = 0.02  # Only suggest if drift > 2%

    for asset_class in target_weights:
        target  = target_weights[asset_class]
        current = current_weights.get(asset_class, 0.0)
        drift   = target - current  # positive = under-weight (need to BUY)

        if abs(drift) <= threshold:
            continue

        action = "BUY" if drift > 0 else "SELL"
        estimated_value = abs(drift) * total_value

        suggestions.append({
            "action":          action,
            "asset_class":     asset_class,
            "symbol":          asset_class.replace("_", " ").upper(),
            "qty_change":      round(abs(drift) * 100, 2),   # % change needed
            "estimated_value": round(estimated_value, 2),
            "drift_impact":    round(abs(drift), 4),
            "current_weight":  round(current, 4),
            "target_weight":   round(target, 4),
        })

    # Sort by drift impact descending
    suggestions.sort(key=lambda x: x["drift_impact"], reverse=True)

    return {
        "currentWeights": current_weights,
        "targetWeights":  target_weights,
        "suggestions":    suggestions,
    }
