import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")


def fetch_stock_price(symbol: str):

    url = "https://www.alphavantage.co/query"

    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }

    response = requests.get(url, params=params)

    data = response.json()

    try:
        price = float(data["Global Quote"]["05. price"])
        return price
    except:
        return None