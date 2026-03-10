def generate_recommendation(user):

    risk = user.risk_profile

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