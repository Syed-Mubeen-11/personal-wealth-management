def calculate_risk_profile(investments):

    total_value = sum(i.current_value or 0 for i in investments)

    stock_value = sum(
        i.current_value or 0
        for i in investments
        if i.asset_type == "stock"
    )

    stock_ratio = stock_value / total_value if total_value else 0

    if stock_ratio > 0.8:
        return "aggressive"

    elif stock_ratio > 0.4:
        return "moderate"

    else:
        return "conservative"