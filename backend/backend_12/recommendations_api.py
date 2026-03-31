# backend_12/recommendations_api.py

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime, timedelta

# --------------------------
# MOCK DB for testing (no real DB needed today)
# --------------------------
class User:
    def __init__(self, id, risk_profile):
        self.id = id
        self.risk_profile = risk_profile

class Investment:
    def __init__(self, user_id, asset_type, amount):
        self.user_id = user_id
        self.asset_type = asset_type
        self.amount = amount

class Recommendation:
    _id_counter = 1
    def __init__(self, user_id, title, recommendation_text, suggested_allocation, created_at=None, is_read=False):
        self.id = Recommendation._id_counter
        Recommendation._id_counter += 1
        self.user_id = user_id
        self.title = title
        self.recommendation_text = recommendation_text
        self.suggested_allocation = suggested_allocation
        self.created_at = created_at or datetime.utcnow()
        self.is_read = is_read

# Mock data storage
USERS = [User(id=1, risk_profile="Moderate")]
INVESTMENTS = [
    Investment(user_id=1, asset_type="Stocks", amount=3000),
    Investment(user_id=1, asset_type="Bonds", amount=2000),
]
RECOMMENDATIONS: List[Recommendation] = []

# --------------------------
# FastAPI setup
# --------------------------
app = FastAPI(title="Recommendations Engine & Allocation API")
router = APIRouter(prefix="/api/v1/recommendations")

# --------------------------
# Allocation Engine
# --------------------------
RISK_TEMPLATES = {
    "Conservative": {"Stocks": 15, "ETFs": 20, "Mutual Funds": 25, "Bonds": 35, "Cash": 5},
    "Moderate": {"Stocks": 35, "ETFs": 25, "Mutual Funds": 20, "Bonds": 15, "Cash": 5},
    "Aggressive": {"Stocks": 55, "ETFs": 25, "Mutual Funds": 10, "Bonds": 5, "Cash": 5},
}

def get_target_allocation(risk_profile: str) -> dict:
    if risk_profile not in RISK_TEMPLATES:
        raise ValueError(f"Unknown risk profile: {risk_profile}")
    return RISK_TEMPLATES[risk_profile]

def compute_recommendation(user_id: int) -> dict:
    # Fetch investments
    investments = [inv for inv in INVESTMENTS if inv.user_id == user_id]
    
    # Current portfolio calculation
    total_value = sum(inv.amount for inv in investments)
    if total_value == 0:
        current_portfolio = {k: 0 for k in RISK_TEMPLATES["Conservative"]}
    else:
        current_portfolio = {}
        for inv in investments:
            current_portfolio[inv.asset_type] = current_portfolio.get(inv.asset_type, 0) + inv.amount
        current_portfolio = {k: (v / total_value) * 100 for k, v in current_portfolio.items()}
    
    # Fetch user
    user = next((u for u in USERS if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target = get_target_allocation(user.risk_profile)
    
    # Recommendation text
    diffs = {k: target[k] - current_portfolio.get(k, 0) for k in target}
    recommendation_text = "; ".join(
        f"{k} {'underweight' if diff>0 else 'overweight'} by {abs(diff):.1f}%"
        for k, diff in diffs.items() if abs(diff) > 0.1
    )
    
    return {
        "title": f"{user.risk_profile} Portfolio Recommendation",
        "recommendation_text": recommendation_text or "Portfolio matches target allocation",
        "suggested_allocation": target
    }

# --------------------------
# Pydantic Schemas
# --------------------------
class RecommendationOut(BaseModel):
    id: int
    title: str
    recommendation_text: str
    suggested_allocation: Dict[str, float]
    created_at: datetime
    is_read: bool

    class Config:
        orm_mode = True

class RecommendationListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[RecommendationOut]

# --------------------------
# API Endpoints
# --------------------------
@router.post("/generate", response_model=RecommendationOut, status_code=201)
def generate_recommendation(user_id: int = 1):
    last_rec = next((r for r in reversed(RECOMMENDATIONS) if r.user_id == user_id), None)
    rec_data = compute_recommendation(user_id)
    
    if last_rec and (datetime.utcnow() - last_rec.created_at < timedelta(hours=24)):
        if last_rec.suggested_allocation == rec_data["suggested_allocation"]:
            raise HTTPException(status_code=304, detail="Recommendation not modified")
    
    new_rec = Recommendation(user_id=user_id, **rec_data)
    RECOMMENDATIONS.append(new_rec)
    return new_rec

@router.get("/", response_model=RecommendationListOut)
def get_recommendations(limit: int = 10, offset: int = 0, user_id: int = 1):
    user_recs = [r for r in RECOMMENDATIONS if r.user_id == user_id]
    total = len(user_recs)
    items = sorted(user_recs, key=lambda r: r.created_at, reverse=True)[offset:offset+limit]
    return {"total": total, "limit": limit, "offset": offset, "items": items}

@router.patch("/{recommendation_id}/read", response_model=RecommendationOut)
def mark_as_read(recommendation_id: int, user_id: int = 1):
    rec = next((r for r in RECOMMENDATIONS if r.id == recommendation_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    rec.is_read = True
    return rec

# --------------------------
# Mount router
# --------------------------
app.include_router(router)