def generate_recommendation(user):
    # Access risk_profile through the linked profile relationship
    # Default to "moderate" if profile is missing or risk is "pending"
    risk = "moderate"
    if user.profile and user.profile.risk_profile != "pending":
        risk = user.profile.risk_profile

    if risk == "aggressive":
        allocation = {
            "stocks": 70,
            "etf": 20,
            "bonds": 10
        }
    elif risk == "conservative":
        allocation = {
            "stocks": 30,
            "etf": 40,
            "bonds": 30
        }
    else:
        # Default allocation for 'moderate' or 'pending' profiles
        allocation = {
            "stocks": 50,
            "etf": 30,
            "bonds": 20
        }

    text = f"Based on your {risk} risk profile, this portfolio allocation is recommended."

    return {
        "recommendation_text": text,
        "suggested_allocation": allocation
    }