def simulate_investment(monthly_contribution, years, annual_return):

    months = years * 12
    monthly_rate = annual_return / 100 / 12

    value = 0
    projection = []

    for month in range(1, months + 1):

        value = (value + monthly_contribution) * (1 + monthly_rate)

        projection.append({
            "month": month,
            "portfolio_value": round(value, 2)
        })

    return projection