import yfinance as yf

def get_stock_price(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")

        if data.empty:
            return None

        price = float(data['Close'].iloc[-1])
        return price

    except Exception as e:
        print("Error fetching stock:", e)
        return None