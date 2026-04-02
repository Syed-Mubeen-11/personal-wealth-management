"""B2-1: Portfolio Rebalance Service"""

from typing import Any, Dict
from sqlalchemy.orm import Session
from app.services.allocation_engine import get_target_allocation


# ✅ Robust category mapping
def get_category(asset_class: str) -> str:
    if not asset_class:
        return "Stocks"

    normalized = asset_class.strip().lower()

    if "mutual" in normalized or "fund" in normalized:
        return "Mutual Funds"
    elif "etf" in normalized:
        return "ETFs"
    elif "bond" in normalized:
        return "Bonds"
    elif "cash" in normalized:
        return "Cash"
    elif "crypto" in normalized or "bitcoin" in normalized:
        return "Crypto"
    else:
        return "Stocks"


_THRESHOLD = 0.01  # 1%


def compute_rebalance(user, db: Session) -> Dict[str, Any]:
    import models

    # --- risk profile ---
    risk_profile = user.risk_profile or "moderate"
    if hasattr(risk_profile, "value"):
        risk_profile = risk_profile.value

    target = get_target_allocation(risk_profile)

    # --- fetch assets ---
    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()

    total_value = 0.0
    category_values: Dict[str, float] = {}
    category_quantities: Dict[str, float] = {}

    # 🔥 STEP 1: Compute values AND quantities together
    for asset in assets:
        value = asset.current_value or (asset.quantity or 0) * (asset.buy_price or 0)
        qty = asset.quantity or 0

        cat = get_category(asset.asset_class or "")

        category_values[cat] = category_values.get(cat, 0.0) + value
        category_quantities[cat] = category_quantities.get(cat, 0.0) + qty

        total_value += value

    # --- current weights ---
    current_weights: Dict[str, float] = {}
    if total_value > 0:
        for cat, val in category_values.items():
            current_weights[cat] = round(val / total_value, 4)

    for cat in target:
        current_weights.setdefault(cat, 0.0)

    # --- suggestions ---
    suggestions = []

    for cat, target_pct in target.items():
        current_pct = current_weights.get(cat, 0.0)
        delta = target_pct - current_pct

        if abs(delta) >= _THRESHOLD:
            estimated_value = round(abs(delta) * total_value, 2)

            category_value = category_values.get(cat, 0.0)
            category_quantity = category_quantities.get(cat, 0.0)

            if category_quantity > 0:
                avg_unit_price = round(category_value / category_quantity, 2)
                qty_change = round(estimated_value / avg_unit_price, 2) if avg_unit_price > 0 else 0.0
            else:
                qty_change = 0.0

            action = "BUY" if delta > 0 else "SELL"

            suggestions.append(
                {
                    "action": action,
                    "symbol": cat,
                    "asset_type": cat,
                    "qty_change": abs(qty_change),
                    "estimated_value": estimated_value,
                    "drift_impact": round(abs(delta) * 100, 2),
                }
            )

    return {
        "risk_profile": risk_profile,
        "total_value": round(total_value, 2),
        "current_weights": {
            k: round(v * 100, 2) for k, v in current_weights.items()
        },
        "target_weights": {
            k: round(v * 100, 2) for k, v in target.items()
        },
        "suggestions": suggestions,
    }