import requests
import os

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")

def search_stocks(keyword: str):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": keyword,
        "apikey": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []

    for item in data.get("bestMatches", []):
        results.append({
            "symbol": item["1. symbol"],
            "name": item["2. name"]
        })

    return results[:5]  # limit results