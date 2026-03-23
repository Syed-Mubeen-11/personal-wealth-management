import requests
import os
from dotenv import load_dotenv

# 🔥 FORCE LOAD .env (important for Celery)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")


def get_asset_price(symbol: str, asset_type: str):
    """Fetch price using Alpha Vantage"""

    print("API KEY:", ALPHAVANTAGE_API_KEY)  # 🔥 debug

    try:
        # ✅ STOCK / ETF
        if asset_type in ["stock", "etf"]:
            url = "https://www.alphavantage.co/query"
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHAVANTAGE_API_KEY
            }

            response = requests.get(url, params=params, timeout=5)
            data = response.json()

            print("API RESPONSE:", data)

            # ❌ API key error
            if "Error Message" in data:
                print("API KEY ERROR")
                return 0.0

            # ❌ rate limit
            if "Note" in data:
                print("RATE LIMIT HIT")
                return 0.0

            # ❌ invalid symbol
            if "Global Quote" not in data or not data["Global Quote"]:
                print("INVALID SYMBOL:", symbol)
                return 0.0

            price = data["Global Quote"].get("05. price")

            if price:
                print("PRICE:", price)
                return float(price)

            return 0.0

        # ✅ MUTUAL FUND
        elif asset_type == "mutual_fund":
            url = f"https://api.mfapi.in/mf/{symbol}"
            response = requests.get(url, timeout=5)
            res = response.json()

            if "data" in res and len(res["data"]) > 0:
                return float(res["data"][0]["nav"])

            return 0.0

        # ✅ BOND
        elif asset_type == "bond":
            return 1000.0

        # ✅ CASH
        elif asset_type == "cash":
            return 1.0

    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return 0.0

    return 0.0