import requests
import os
from dotenv import load_dotenv
from app.services.yahoo_finance import get_yahoo_price_with_retry

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")


def get_alpha_vantage_price(symbol):
    """Fetch price from Alpha Vantage"""
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": ALPHAVANTAGE_API_KEY
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if "Global Quote" in data and data["Global Quote"]:
            price = data["Global Quote"].get("05. price")
            if price:
                print(f"✅ Alpha Vantage: {symbol} = ₹{price}")
                return float(price)
        return None
    except Exception as e:
        print(f"❌ Alpha Vantage error: {e}")
        return None


def get_asset_price(symbol: str, asset_type: str):
    """Fetch price using Yahoo Finance for Indian stocks, Alpha Vantage for others"""
    
    print(f"🔍 Fetching price for {symbol} ({asset_type})")
    
    try:
        # STOCK / ETF
        if asset_type in ["stock", "etf"]:
            # Check if it's an Indian stock (ends with .NS or .BSE)
            if symbol.endswith('.NS') or symbol.endswith('.BSE'):
                # Use Yahoo Finance for Indian stocks
                price = get_yahoo_price_with_retry(symbol)
                if price:
                    return price
                # Fallback to Alpha Vantage if Yahoo fails
                print(f"⚠️ Yahoo failed, trying Alpha Vantage")
                return get_alpha_vantage_price(symbol)
            else:
                # Use Alpha Vantage for US stocks
                return get_alpha_vantage_price(symbol)

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