from app.services.alpha_vantage import fetch_stock_price

price = fetch_stock_price("AAPL")

print("AAPL price:", price)