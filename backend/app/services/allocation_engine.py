from typing import Dict, Any
from sqlalchemy.orm import Session

# B1-1: Risk templates (decimals 0.15 = 15%)
TEMPLATES: Dict[str, Dict[str, float]] = {
    "conservative": {"Stocks": 0.15, "ETFs": 0.20, "Mutual Funds": 0.25, "Bonds": 0.35, "Cash": 0.05},
    "moderate": {"Stocks": 0.35, "ETFs": 0.25, "Mutual Funds": 0.20, "Bonds": 0.15, "Cash": 0.05},
    "aggressive": {"Stocks": 0.55, "ETFs": 0.25, "Mutual Funds": 0.10, "Bonds": 0.05, "Cash": 0.05}
}

def get_target_allocation(risk_profile: str) -> Dict[str, float]:
    """B1-1: Get target by risk profile"""
    key = risk_profile.strip().lower() if risk_profile else "moderate"
    return TEMPLATES.get(key, TEMPLATES["moderate"])

def compute_recommendation(user, db: Session) -> Dict[str, Any]:
    """B1-1: Compute and SAVE a recommendation based on risk profile and current portfolio."""
    from app.services.rebalance_service import compute_rebalance
    import models

    risk_profile = user.risk_profile or "moderate"
    if hasattr(risk_profile, "value"):
        risk_profile = risk_profile.value

    # Get target allocation
    target = get_target_allocation(risk_profile)

    # Get portfolio gap
    rebalance = compute_rebalance(user, db)

    # Generate detailed recommendation text from suggestions
    suggestions = rebalance.get("suggestions", [])
    if not suggestions:
        rec_text = "Your portfolio is perfectly balanced! No action needed at this time."
    else:
        parts = []
        for s in suggestions:
            parts.append(
                f"{s['action']} {s['symbol']} ({s['asset_type']}) — "
                f"{s['qty_change']} units ≈ ${s['estimated_value']:,.2f} "
                f"(drift {s['drift_impact']:.1f}%)"
            )
        rec_text = (
            f"Based on your {risk_profile} risk profile, we recommend "
            f"the following adjustments to realign your portfolio: "
            + "; ".join(parts)
            + "."
        )

    rec = models.Recommendation(
        user_id=user.id,
        title=f"{risk_profile.capitalize()} Risk Recommendation",
        recommendation_text=rec_text,
        suggested_allocation=target,
        is_read=0,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": rec.id,
        "title": rec.title,
        "recommendation_text": rec.recommendation_text,
        "suggested_allocation": rec.suggested_allocation,
        "is_read": False,
        "created_at": rec.created_at,
    }
