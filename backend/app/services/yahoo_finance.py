import requests
import time

def get_yahoo_price(symbol):
    """Fetch current price from Yahoo Finance (no API key needed)"""
    try:
        # Yahoo Finance uses .NS suffix for Indian stocks
        if not symbol.endswith('.NS') and not symbol.endswith('.BSE'):
            yahoo_symbol = f"{symbol}.NS"
        else:
            yahoo_symbol = symbol
            
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        # Extract price from response
        if data.get('chart', {}).get('result'):
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            price = meta.get('regularMarketPrice')
            
            if price:
                print(f"✅ Yahoo: {symbol} = ₹{price}")
                return float(price)
            
            # Alternative: get from indicators
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