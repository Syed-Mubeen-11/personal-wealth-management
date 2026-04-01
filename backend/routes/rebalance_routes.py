from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models.models as models 
from core.database import SessionLocal
from core.auth import get_current_user

# Importing Investment model as per your Finance/Investment routes
from models.investment_model import Investment

router = APIRouter(
    prefix="/api/v1/rebalance",
    tags=["Rebalance Engine"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/calculate")
async def calculate_drift(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. IDENTIFY USER RISK PROFILE
    # Matches your UserProfile schema (investment_risk/risk_profile)
    risk = "MODERATE"
    if hasattr(current_user, 'profile') and current_user.profile:
        db_risk = current_user.profile.risk_profile or current_user.profile.investment_risk
        if db_risk and db_risk.lower() != "pending":
            risk = db_risk.upper()
    
    # Target Allocations based on Indian Market Standards
    strategies = {
        "AGGRESSIVE": {"Stocks": 70, "ETFs": 20, "Bonds": 10},
        "MODERATE": {"Stocks": 50, "ETFs": 30, "Bonds": 20},
        "CONSERVATIVE": {"Stocks": 30, "ETFs": 40, "Bonds": 30}
    }
    target = strategies.get(risk, strategies["MODERATE"])

    # 2. FETCH AND VALIDATE HOLDINGS
    holdings = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    # Sum current_value, ensuring we handle None values safely
    total_val = sum((h.current_value or 0) for h in holdings)

    if total_val == 0:
        return {
            "risk_profile": risk,
            "total_value": 0,
            "drift_report": [],
            "suggestions": [{"type": "INFO", "message": "Add investments to see rebalancing data."}]
        }

    # 3. ROBUST CATEGORY MAPPING
    # This maps your DB 'asset_type' (Gold, Stock, etc.) to Rebalance Categories
    current_alloc = {"Stocks": 0, "ETFs": 0, "Bonds": 0}
    
    for h in holdings:
        # Normalize the string from your 'add_investment' route
        raw_type = (h.asset_type or "Stock").strip().lower()
        
        if "stock" in raw_type:
            cat_key = "Stocks"
        elif "etf" in raw_type or "gold" in raw_type:
            # Gold (like SETFGOLD.NS) is treated as an ETF for rebalancing
            cat_key = "ETFs"
        elif "bond" in raw_type or "debt" in raw_type or "liquid" in raw_type:
            cat_key = "Bonds"
        else:
            # Default fallback to prevent data loss in the calculation
            cat_key = "Stocks"
            
        current_alloc[cat_key] += ((h.current_value or 0) / total_val) * 100

    # 4. CALCULATE DRIFT & GENERATE SMART SUGGESTIONS
    drift_report = []
    suggestions = []

    for category, target_pct in target.items():
        actual_pct = round(current_alloc.get(category, 0), 1)
        target_pct = float(target_pct)
        drift = round(actual_pct - target_pct, 1)

        drift_report.append({
            "category": category,
            "actual": actual_pct,
            "target": target_pct,
            "drift": drift
        })

        # Threshold: Suggest a trade if drift is > 3%
        if abs(drift) > 3:
            action = "SELL" if drift > 0 else "BUY"
            # Calculate the Rupee amount needed to fix the drift
            diff_amount = abs(drift / 100 * total_val)
            
            suggestions.append({
                "type": action,
                "message": f"{action} approx ₹{diff_amount:,.0f} in {category} to restore your {risk} profile balance."
            })

    return {
        "risk_profile": risk,
        "total_value": round(total_val, 2),
        "drift_report": drift_report,
        "suggestions": suggestions
    }