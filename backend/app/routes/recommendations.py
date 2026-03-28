from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.investments import Investment, AssetTypeEnum
from datetime import datetime

router = APIRouter()


# ─── Helper: Target allocation per risk profile ──────────────────────────────
TARGET_WEIGHTS = {
    "aggressive": {
        "stock":       0.60,
        "etf":         0.20,
        "mutual_fund": 0.10,
        "bond":        0.05,
        "cash":        0.05,
    },
    "moderate": {
        "stock":       0.40,
        "etf":         0.20,
        "mutual_fund": 0.15,
        "bond":        0.20,
        "cash":        0.05,
    },
    "conservative": {
        "stock":       0.20,
        "etf":         0.15,
        "mutual_fund": 0.20,
        "bond":        0.40,
        "cash":        0.05,
    },
}

# ─── Helper: Recommendation text per risk profile ────────────────────────────
RECOMMENDATION_TEMPLATES = {
    "aggressive": [
        {
            "title": "Maximize Equity Growth",
            "recommendation_text": (
                "Your aggressive risk profile supports a high equity allocation. "
                "Focus on growth stocks and diversified ETFs for long-term capital appreciation."
            ),
            "suggested_allocation": TARGET_WEIGHTS["aggressive"],
        },
        {
            "title": "Diversify with ETFs",
            "recommendation_text": (
                "Reduce concentration risk by shifting some individual stock exposure "
                "into broad-market ETFs while maintaining your aggressive stance."
            ),
            "suggested_allocation": {
                "stock": 0.50, "etf": 0.30,
                "mutual_fund": 0.10, "bond": 0.05, "cash": 0.05
            },
        },
    ],
    "moderate": [
        {
            "title": "Balanced Growth Strategy",
            "recommendation_text": (
                "A balanced mix of equities and bonds suits your moderate risk profile. "
                "Consider index funds and dividend stocks for steady growth with lower volatility."
            ),
            "suggested_allocation": TARGET_WEIGHTS["moderate"],
        },
        {
            "title": "Add Bond Stability",
            "recommendation_text": (
                "Increasing your bond allocation can cushion against market downturns "
                "while still allowing meaningful equity participation."
            ),
            "suggested_allocation": {
                "stock": 0.35, "etf": 0.20,
                "mutual_fund": 0.15, "bond": 0.25, "cash": 0.05
            },
        },
    ],
    "conservative": [
        {
            "title": "Capital Preservation Focus",
            "recommendation_text": (
                "Your conservative profile prioritizes capital safety. "
                "A bond-heavy portfolio with some mutual funds provides stable returns with minimal risk."
            ),
            "suggested_allocation": TARGET_WEIGHTS["conservative"],
        },
        {
            "title": "Low-Risk Diversification",
            "recommendation_text": (
                "Consider diversifying into liquid mutual funds and government bonds "
                "to earn steady returns while keeping your principal safe."
            ),
            "suggested_allocation": {
                "stock": 0.15, "etf": 0.10,
                "mutual_fund": 0.25, "bond": 0.45, "cash": 0.05
            },
        },
    ],
}


# ─── GET /recommendations ────────────────────────────────────────────────────
@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns personalized recommendations based on the user's risk profile.
    """
    risk_profile = current_user.risk_profile or "moderate"

    templates = RECOMMENDATION_TEMPLATES.get(risk_profile, RECOMMENDATION_TEMPLATES["moderate"])

    recommendations = []
    for idx, template in enumerate(templates):
        recommendations.append({
            "id": idx + 1,
            "title": template["title"],
            "recommendation_text": template["recommendation_text"],
            "suggested_allocation": template["suggested_allocation"],
            "created_at": datetime.utcnow().isoformat(),
            "is_read": False,
        })

    return recommendations


# ─── PATCH /recommendations/{id}/read ───────────────────────────────────────
@router.patch("/{recommendation_id}/read")
def mark_recommendation_read(
    recommendation_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Marks a recommendation as read.
    Since recommendations are generated dynamically (not stored in DB yet),
    this endpoint acknowledges the action successfully.
    """
    return {
        "message": f"Recommendation {recommendation_id} marked as read",
        "id": recommendation_id,
        "is_read": True
    }


# ─── GET /recommendations/rebalance ─────────────────────────────────────────
@router.get("/rebalance")
def get_rebalance_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compares current portfolio allocation vs target weights
    and returns drift + suggested rebalancing actions.
    """
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    if not investments:
        return {
            "currentWeights": {},
            "targetWeights": {},
            "suggestions": [],
            "message": "No investments found"
        }

    # ── Calculate current weights ─────────────────────────────────────────
    total_value = sum(float(inv.current_value or 0) for inv in investments)

    if total_value == 0:
        return {
            "currentWeights": {},
            "targetWeights": {},
            "suggestions": [],
            "message": "Portfolio has no value"
        }

    # Group value by asset type
    asset_values = {asset.value: 0.0 for asset in AssetTypeEnum}
    for inv in investments:
        asset_key = inv.asset_type.value if hasattr(inv.asset_type, 'value') else str(inv.asset_type)
        asset_values[asset_key] += float(inv.current_value or 0)

    current_weights = {
        asset: round(value / total_value, 4)
        for asset, value in asset_values.items()
    }

    # ── Get target weights from risk profile ──────────────────────────────
    risk_profile = current_user.risk_profile or "moderate"
    target_weights = TARGET_WEIGHTS.get(risk_profile, TARGET_WEIGHTS["moderate"])

    # ── Calculate drift and suggestions ───────────────────────────────────
    suggestions = []
    DRIFT_THRESHOLD = 0.05  # 5% drift triggers a suggestion

    for asset, target in target_weights.items():
        current = current_weights.get(asset, 0.0)
        drift = current - target

        if drift > DRIFT_THRESHOLD:
            # Overweight — suggest selling
            excess_value = round(drift * total_value, 2)
            suggestions.append({
                "asset": asset,
                "action": "Sell",
                "amount": excess_value,
                "reason": f"Overweight by {round(drift * 100, 1)}% — reduce {asset} exposure",
            })
        elif drift < -DRIFT_THRESHOLD:
            # Underweight — suggest buying
            deficit_value = round(abs(drift) * total_value, 2)
            suggestions.append({
                "asset": asset,
                "action": "Buy",
                "amount": deficit_value,
                "reason": f"Underweight by {round(abs(drift) * 100, 1)}% — increase {asset} exposure",
            })

    # Sort suggestions: largest drift first
    suggestions.sort(key=lambda x: x["amount"], reverse=True)

    return {
        "currentWeights": current_weights,
        "targetWeights": target_weights,
        "suggestions": suggestions,
        "totalPortfolioValue": round(total_value, 2),
        "riskProfile": risk_profile,
    }