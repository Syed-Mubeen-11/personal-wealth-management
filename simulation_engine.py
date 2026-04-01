def calculate_future_value(monthly_contribution, annual_return, years, initial_amount=0):

    total_value = initial_amount
    yearly_breakdown = []

    for year in range(1, years + 1):

        yearly_investment = monthly_contribution * 12

        total_value = (total_value + yearly_investment) * (1 + annual_return/100)

        yearly_breakdown.append({
            "year": year,
            "investment": yearly_investment,
            "value": round(total_value, 2)
        })

    return yearly_breakdown


def get_recommendations(data):
    # simple logic (temporary)
    income = data.get("income", 0)

    if income > 50000:
        return {"plan": "Invest in stocks", "risk": "Medium"}
    else:
        return {"plan": "Save more, low risk investment", "risk": "Low"}