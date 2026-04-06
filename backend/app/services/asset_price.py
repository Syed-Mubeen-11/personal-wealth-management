import requests
import time

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
                print(f"✅ Yahoo: {symbol} = ₹{price}")
                return float(price)
            
            indicators = result.get('indicators', {})
            quote = indicators.get('quote', [{}])[0]
            price = quote.get('close', [None])[-1]
            if price:
                print(f"✅ Yahoo: {symbol} = ₹{price}")
                return float(price)
        
        print(f"⚠️ Yahoo: No data for {symbol}")
        return None
        
    except Exception as e:
        print(f"❌ Yahoo Finance error for {symbol}: {e}")
        return None


def get_yahoo_price_with_retry(symbol, max_retries=2):
    """Fetch price with retry logic"""
    for attempt in range(max_retries):
        price = get_yahoo_price(symbol)
        if price:
            return price
        if attempt < max_retries - 1:
            time.sleep(1)
    return None


def get_asset_price(symbol: str, asset_type: str):
    """Fetch price using Yahoo Finance for all stocks and ETFs"""
    
    print(f"🔍 Fetching price for {symbol} ({asset_type})")
    
    try:
        # STOCK / ETF - Use Yahoo Finance only
        if asset_type in ["stock", "etf"]:
            price = get_yahoo_price_with_retry(symbol)
            if price:
                return price
            else:
                print(f"⚠️ Could not fetch price for {symbol}")
                return None

        # MUTUAL FUND
        elif asset_type == "mutual_fund":
            return get_mutual_fund_price(symbol)

        # BOND
        elif asset_type == "bond":
            print(f"✅ {symbol}: Bond price ₹1000 (default)")
            return 1000.0

        # CASH
        elif asset_type == "cash":
            return 1.0

    except Exception as e:
        print(f"❌ Error fetching price for {symbol}: {e}")
        return None

    return None


def get_mutual_fund_price(symbol):
    """Fetch mutual fund NAV from MFAPI"""
    try:
        url = f"https://api.mfapi.in/mf/{symbol}"
        response = requests.get(url, timeout=10)
        data = response.json()

        if "data" in data and len(data["data"]) > 0:
            nav = data["data"][0]["nav"]
            print(f"✅ MFAPI: {symbol} = ₹{nav}")
            return float(nav)
        else:
            print(f"⚠️ MFAPI: No data for {symbol}")
            return None

    except Exception as e:
        print(f"❌ MFAPI error for {symbol}: {e}")
        return None
