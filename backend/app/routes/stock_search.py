import requests
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


def get_yahoo_price(symbol):
    """Fetch current price from Yahoo Finance"""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('chart', {}).get('result'):
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            price = meta.get('regularMarketPrice')
            
            if price:
                return float(price)
            
            # Alternative: get from indicators
            indicators = result.get('indicators', {})
            quote = indicators.get('quote', [{}])[0]
            price = quote.get('close', [None])[-1]
            if price:
                return float(price)
        
        return 0.0
        
    except Exception as e:
        print(f"Yahoo Finance error for {symbol}: {e}")
        return 0.0


def search_stocks_yahoo(keyword: str, asset_type: str = None):
    """Search stocks using Yahoo Finance"""
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
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


@router.get("/search")
def search_stock(keyword: str, asset_type: str = None, current_user: User = Depends(get_current_user)):
    """Search stocks using Yahoo Finance"""
    return search_stocks_yahoo(keyword, asset_type)


@router.get("/price/{symbol}")
def get_price(symbol: str, current_user: User = Depends(get_current_user)):
    """Get current price using Yahoo Finance"""
    price = get_yahoo_price(symbol)
    return {"price": price}
