import yfinance as yf
import requests

def get_asset_price(symbol: str, asset_type: str):
    """Fetches the latest price for a given asset symbol and type."""
    try:
        if asset_type in ["stock", "etf"]:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")
            
            if data.empty:
                # Fallback: try fetching current price via ticker info if history is empty
                try:
                    price = ticker.info.get('regularMarketPrice') or ticker.info.get('previousClose')
                    if price:
                        return float(price)
                except:
                    pass
                return 0.0
                
            return float(data["Close"].iloc[-1])

        elif asset_type == "mutual_fund":
            url = f"https://api.mfapi.in/mf/{symbol}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            res = response.json()
            if "data" in res and len(res["data"]) > 0:
                return float(res["data"][0]["nav"])
            return 0.0

        elif asset_type == "bond":
            return 1000.0

        elif asset_type == "cash":
            return 1.0

    except Exception as e:
        print(f"Error fetching price for {symbol} ({asset_type}): {e}")
        return 0.0

    return 0.0