def get_target_allocation(risk_profile):
    if risk_profile == "Conservative":
        return {"stocks": 15, "etf": 20, "mf": 25, "bonds": 35, "cash": 5}
    elif risk_profile == "Moderate":
        return {"stocks": 35, "etf": 25, "mf": 20, "bonds": 15, "cash": 5}
    else:
        return {"stocks": 55, "etf": 25, "mf": 10, "bonds": 5, "cash": 5}


def generate_recommendation(user_id):
    risk = "Moderate"  # you can change later
    allocation = get_target_allocation(risk)

    return {
        "title": "Investment Plan",
        "risk": risk,
        "suggested_allocation": allocation,
        "recommendation_text": "Increase stocks for better returns."
    }