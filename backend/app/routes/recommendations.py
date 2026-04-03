from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.investments import Investment, AssetTypeEnum
from app.models.goals import Goal
from app.services.recommendation_engine import (
    full_analysis,
    portfolio_wealth_score,
    goal_insights,
    smart_actions,
    TARGET_WEIGHTS,
)
from datetime import datetime

router = APIRouter()


# ─── Recommendation text templates (legacy simple endpoint) ──────────────────

RECOMMENDATION_TEMPLATES = {
    "aggressive": [
        {
            "title": "Maximise Equity Growth",
            "recommendation_text": (
                "Your aggressive wealth profile supports a high equity allocation. "
                "Focus on growth stocks and diversified ETFs for long-term wealth appreciation."
            ),
            "suggested_allocation": TARGET_WEIGHTS["aggressive"],
        },
        {
            "title": "Diversify with ETFs",
            "recommendation_text": (
                "Reduce concentration risk by shifting some individual stock exposure "
                "into broad-market ETFs while maintaining your aggressive wealth strategy."
            ),
            "suggested_allocation": {
                "stock": 0.50, "etf": 0.30,
                "mutual_fund": 0.10, "bond": 0.05, "cash": 0.05
            },
        },
    ],
    "moderate": [
        {
            "title": "Balanced Wealth Growth Strategy",
            "recommendation_text": (
                "A balanced mix of equities and bonds suits your moderate wealth profile. "
                "Consider index funds and dividend stocks for steady wealth growth with lower volatility."
            ),
            "suggested_allocation": TARGET_WEIGHTS["moderate"],
        },
        {
            "title": "Add Bond Stability",
            "recommendation_text": (
                "Increasing your bond allocation can cushion against market downturns "
                "while still allowing meaningful equity participation in wealth building."
            ),
            "suggested_allocation": {
                "stock": 0.35, "etf": 0.20,
                "mutual_fund": 0.15, "bond": 0.25, "cash": 0.05
            },
        },
    ],
    "conservative": [
        {
            "title": "Wealth Preservation Focus",
            "recommendation_text": (
                "Your conservative profile prioritises capital safety. "
                "A bond-heavy portfolio with some mutual funds provides stable wealth returns with minimal risk."
            ),
            "suggested_allocation": TARGET_WEIGHTS["conservative"],
        },
        {
            "title": "Low-Risk Wealth Diversification",
            "recommendation_text": (
                "Consider diversifying into liquid mutual funds and government bonds "
                "to earn steady returns while keeping your wealth principal safe."
            ),
            "suggested_allocation": {
                "stock": 0.15, "etf": 0.10,
                "mutual_fund": 0.25, "bond": 0.45, "cash": 0.05
            },
        },
    ],
}


# ─── GET /recommendations ─────────────────────────────────────────────────────
@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Legacy endpoint: returns 2 static personalized recommendations
    based on the user's risk profile.
    """
    risk_profile = (
        current_user.risk_profile.value
        if hasattr(current_user.risk_profile, "value")
        else str(current_user.risk_profile or "moderate")
    )

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


# ─── PATCH /recommendations/{id}/read ────────────────────────────────────────
@router.patch("/{recommendation_id}/read")
def mark_recommendation_read(
    recommendation_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Marks a recommendation as read.
    Since recommendations are generated dynamically, this endpoint
    acknowledges the action successfully.
    """
    return {
        "message": f"Recommendation {recommendation_id} marked as read",
        "id": recommendation_id,
        "is_read": True
    }


# ─── GET /recommendations/analyze ────────────────────────────────────────────
@router.get("/analyze")
def get_full_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Full wealth management recommendation engine.
    Returns portfolio wealth score, smart actions, goal insights,
    and allocation drift analysis.
    """
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    return full_analysis(current_user, investments, goals)


# ─── GET /recommendations/wealth-score ───────────────────────────────────────
@router.get("/wealth-score")
def get_wealth_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns just the composite portfolio wealth score breakdown.
    """
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    risk_profile = (
        current_user.risk_profile.value
        if hasattr(current_user.risk_profile, "value")
        else str(current_user.risk_profile or "moderate")
    )

    return portfolio_wealth_score(investments, risk_profile)


# ─── GET /recommendations/rebalance ──────────────────────────────────────────
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
    risk_profile = (
        current_user.risk_profile.value
        if hasattr(current_user.risk_profile, "value")
        else str(current_user.risk_profile or "moderate")
    )
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
                "reason": f"Overweight by {round(drift * 100, 1)}% — reduce {asset} exposure to optimise wealth allocation",
            })
        elif drift < -DRIFT_THRESHOLD:
            # Underweight — suggest buying
            deficit_value = round(abs(drift) * total_value, 2)
            suggestions.append({
                "asset": asset,
                "action": "Buy",
                "amount": deficit_value,
                "reason": f"Underweight by {round(abs(drift) * 100, 1)}% — increase {asset} exposure for optimal wealth growth",
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