from typing import Dict

# B1-1: Risk templates (decimals 0.15 = 15%)
TEMPLATES: Dict[str, Dict[str, float]] = {
    "conservative": {"Stocks": 0.15, "ETFs": 0.20, "Mutual Funds": 0.25, "Bonds": 0.35, "Cash": 0.05},
    "moderate": {"Stocks": 0.35, "ETFs": 0.25, "Mutual Funds": 0.20, "Bonds": 0.15, "Cash": 0.05},
    "aggressive": {"Stocks": 0.55, "ETFs": 0.25, "Mutual Funds": 0.10, "Bonds": 0.05, "Cash": 0.05}
}

def get_target_allocation(risk_profile: str) -> Dict[str, float]:
    """B1-1: Get target by risk profile"""
    if risk_profile not in TEMPLATES:
        raise ValueError(f"Unknown risk_profile: {risk_profile}")
    return TEMPLATES[risk_profile]

def compute_recommendation(user_id: int, db=None) -> Dict:
    """B1-1: Compute rec (connect to DB later)"""
    # TODO: Real DB query (Milestone 3 Investments)
    target = get_target_allocation("moderate")  # Demo
    return {
        "title": "Moderate Risk Recommendation",
        "recommendation_text": "Stocks overweight 10%. Reduce to 35%, add Bonds.",
        "suggested_allocation": target
    }
