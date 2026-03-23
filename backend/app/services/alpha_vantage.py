import requests
import os
from dotenv import load_dotenv

# ✅ Ensure .env is loaded properly
load_dotenv()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")  # ✅ FIXED NAME


def fetch_stock_price(symbol: str):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }

    print("API KEY:", API_KEY)  # 🔥 debug

    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()

        print("API RESPONSE:", data)  # 🔥 debug

        # ❌ API key invalid
        if "Error Message" in data:
            print("INVALID API KEY")
            return 0.0

        # ❌ Rate limit
        if "Note" in data:
            print("RATE LIMIT HIT")
            return 0.0

        # ❌ Invalid symbol
        if "Global Quote" not in data or not data["Global Quote"]:
            print("INVALID SYMBOL:", symbol)
            return 0.0

        price = data["Global Quote"].get("05. price")

        if price:
            return float(price)

        return 0.0

    except Exception as e:
        print("ERROR:", e)
        return 0.0