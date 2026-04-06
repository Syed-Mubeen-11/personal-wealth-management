import requests
import time

def search_stocks(keyword: str, asset_type: str = None):
    """Search stocks using Yahoo Finance - works for Indian stocks"""
    
    if not keyword or len(keyword) < 2:
        return []
    
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": keyword,
        "quotesCount": 15,
        "newsCount": 0,
        "enableFuzzyQuery": False
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    time.sleep(0.3)
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 429:
            time.sleep(2)
            response = requests.get(url, params=params, headers=headers, timeout=10)
        
        data = response.json()
        
        results = []
        for quote in data.get("quotes", []):
            symbol = quote.get("symbol", "")
            name = quote.get("shortname", quote.get("longname", ""))
            quote_type = quote.get("quoteType", "").lower()
            
            if quote_type == "equity":
                mapped_type = "stock"
            elif quote_type == "etf":
                mapped_type = "etf"
            else:
                mapped_type = "mutual_fund"
            
            if asset_type and asset_type != mapped_type:
                continue
            
            results.append({
                "symbol": symbol,
                "name": name,
                "type": mapped_type
            })
        
        return results[:10]
        
    except Exception as e:
        print(f"Search error: {e}")
        return []
