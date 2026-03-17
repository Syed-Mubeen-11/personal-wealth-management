from core.celery_app import celery_app
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Example DB function (replace with your ORM logic)
def update_investment_in_db(symbol, price):
    print(f"Updating {symbol} → {price}")
    # TODO: Replace with actual DB update logic
    # update current_value, last_price, last_price_at

import requests
import os

def fetch_price(symbol):
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")

    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"

    try:
        response = requests.get(url)
        data = response.json()

        # DEBUG PRINT
        print(f"{symbol} API response:", data)

        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            return float(data["Global Quote"]["05. price"])
        else:
            print(f"Error fetching {symbol}: Invalid API response")
            return None

    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None


@celery_app.task
def nightly_refresh():
    print("Starting Nightly Refresh...")

    symbols = ["AAPL", "GOOGL", "TSLA"]

    for symbol in symbols:
        print(f"Fetching price for {symbol}")
        price = fetch_price(symbol)

        if price:
            print(f"Updating {symbol} → {price}")
            update_investment_in_db(symbol, price)

    print("Nightly Refresh Completed")

@celery_app.task
def nightly_refresh():
    print("Starting Nightly Refresh...")

    symbols = ["AAPL", "GOOGL"]

    for symbol in symbols:
        price = fetch_price(symbol)

        if price:
            timestamp = datetime.now()
            print(f"{symbol} → {price} at {timestamp}")

    print("Nightly Refresh Completed")
