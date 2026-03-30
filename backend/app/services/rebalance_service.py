"""B2-1: Portfolio Rebalance Service

Computes the gap between a user's current asset-class weights
and the target allocation from BE-1's allocation_engine, then
returns actionable suggestions.
"""

from typing import Any, Dict
from sqlalchemy.orm import Session

from app.services.allocation_engine import get_target_allocation

# Map DB asset_class values → allocation-template category names
_CLASS_MAP: Dict[str, str] = {
    "Stock": "Stocks",
    "ETF": "ETFs",
    "Bond": "Bonds",
    "Cash": "Cash",
    "Crypto": "Stocks",   # crypto grouped with equities for rebalance
    "Other": "Stocks",
}

# Minimum percentage-point delta to flag a suggestion
_THRESHOLD = 0.01  # 1 %


def compute_rebalance(user, db: Session) -> Dict[str, Any]:
    """Return current vs target weights and rebalance suggestions."""

    import models  # local import to avoid circular dependency with root models

    # --- risk profile -------------------------------------------------------
    risk_profile = user.risk_profile or "moderate"
    if hasattr(risk_profile, "value"):
        risk_profile = risk_profile.value

    target = get_target_allocation(risk_profile)

    # --- current holdings ----------------------------------------------------
    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()

    total_value = 0.0
    category_values: Dict[str, float] = {}
    for asset in assets:
        value = asset.current_value or (asset.quantity or 0) * (asset.buy_price or 0)
        cat = _CLASS_MAP.get(asset.asset_class, "Stocks")
        category_values[cat] = category_values.get(cat, 0.0) + value
        total_value += value

    # --- current weights -----------------------------------------------------
    current_weights: Dict[str, float] = {}
    if total_value > 0:
        for cat, val in category_values.items():
            current_weights[cat] = round(val / total_value, 4)

    # ensure every target category appears
    for cat in target:
        current_weights.setdefault(cat, 0.0)

    # --- suggestions ---------------------------------------------------------
    suggestions = []
    for cat, target_pct in target.items():
        current_pct = current_weights.get(cat, 0.0)
        delta = target_pct - current_pct
        if abs(delta) >= _THRESHOLD:
            action = "Increase" if delta > 0 else "Decrease"
            suggestions.append(
                {
                    "asset_class": cat,
                    "current_pct": round(current_pct * 100, 2),
                    "target_pct": round(target_pct * 100, 2),
                    "delta_pct": round(delta * 100, 2),
                    "action": f"{action} {cat} by {abs(round(delta * 100, 2))}%",
                }
            )

    return {
        "risk_profile": risk_profile,
        "total_value": round(total_value, 2),
        "current_weights": {k: round(v * 100, 2) for k, v in current_weights.items()},
        "target_weights": {k: round(v * 100, 2) for k, v in target.items()},
        "suggestions": suggestions,
    }
