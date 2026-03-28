import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")

def search_stocks(keyword: str, asset_type: str = None):
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": keyword,
        "apikey": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []
    
    # Simple mapping from bestMatches
    for item in data.get("bestMatches", []):
        symbol = item["1. symbol"]
        name = item["2. name"]
        type_str = item.get("3. type", "").lower()

        # Simple Filtering
        if asset_type:
            at_lower = asset_type.lower()
            if at_lower == "stock" and "equity" not in type_str: continue
            if at_lower == "etf" and "etf" not in type_str: continue
            if at_lower == "mutual_fund" and "mutual fund" not in type_str: continue

        results.append({
            "symbol": symbol,
            "name": name,
            "type": type_str
        })

    return results[:10]




