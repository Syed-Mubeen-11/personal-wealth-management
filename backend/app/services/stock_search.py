import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")

def search_stocks(keyword: str, asset_type: str = None):
    if not API_KEY:
        print("ERROR: No API key found!")
        return []
    
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": keyword,
        "apikey": API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if "Error Message" in data:
            print("API Error:", data["Error Message"])
            return []
        
        results = []
        for item in data.get("bestMatches", []):
            symbol = item.get("1. symbol", "")
            name = item.get("2. name", "")
            type_str = item.get("3. type", "").lower()

            if asset_type:
                at_lower = asset_type.lower()
                if at_lower == "stock" and "equity" not in type_str: 
                    continue
                if at_lower == "etf" and "etf" not in type_str: 
                    continue
                if at_lower == "mutual_fund" and "mutual fund" not in type_str: 
                    continue

            results.append({
                "symbol": symbol,
                "name": name,
                "type": type_str
            })

        return results[:10]
        
    except Exception as e:
        print(f"Request error: {e}")
        return []