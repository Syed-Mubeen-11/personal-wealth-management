import yfinance as yf
import requests

def get_asset_price(symbol: str, asset_type: str):

    if asset_type in ["stock", "etf"]:
        data = yf.Ticker(symbol).history(period="1d")
        return float(data["Close"].iloc[-1])

    elif asset_type == "mutual_fund":
        url = f"https://api.mfapi.in/mf/{symbol}"
        res = requests.get(url).json()
        return float(res["data"][0]["nav"])

    elif asset_type == "bond":
        # simple placeholder logic
        return 1000

    elif asset_type == "cash":
        return 1

    return None