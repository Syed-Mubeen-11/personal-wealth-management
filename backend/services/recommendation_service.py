import yfinance as yf

def fetch_live_market_data(tickers):
    """Fetches real-time price and change % for NSE tickers"""
    enriched_stocks = []
    for symbol in tickers:
        try:
            ticker = yf.Ticker(symbol)
            # Use fast_info for speed or history for reliability
            info = ticker.history(period="1d")
            if not info.empty:
                current_price = info['Close'].iloc[-1]
                prev_close = info['Open'].iloc[-1]
                change_pct = ((current_price - prev_close) / prev_close) * 100
                
                enriched_stocks.append({
                    "symbol": symbol.replace(".NS", ""),
                    "price": round(current_price, 2),
                    "change": round(change_pct, 2)
                })
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            enriched_stocks.append({"symbol": symbol.replace(".NS", ""), "price": 0, "change": 0})
    return enriched_stocks

def generate_recommendation(user):
    risk = user.profile.risk_profile.lower() if user.profile else "moderate"
    
    # Mapping
    config = {
        "aggressive": {
            "alloc": {"Stocks": 70, "ETFs": 20, "Bonds": 10},
            "tickers": ["ZOMATO.NS", "TATAELXSI.NS", "HAL.NS", "MON100.NS"],
            "title": "Aggressive Growth"
        },
        "conservative": {
            "alloc": {"Stocks": 30, "ETFs": 40, "Bonds": 30},
            "tickers": ["HDFCBANK.NS", "ITC.NS", "NIFTYBEES.NS", "GOLDSHARE.NS"],
            "title": "Capital Preservation"
        },
        "moderate": {
            "alloc": {"Stocks": 50, "ETFs": 30, "Bonds": 20},
            "tickers": ["RELIANCE.NS", "TCS.NS", "INFY.NS", "JUNIORBEES.NS"],
            "title": "Balanced Wealth"
        }
    }
    
    selected = config.get(risk, config["moderate"])
    
    # B1: Fetch Real Prices
    live_picks = fetch_live_market_data(selected["tickers"])
    
    return {
        "id": 1,
        "title": selected["title"],
        "recommendation_text": f"Based on your {risk} profile, we suggest a {selected['alloc']['Stocks']}% Equity exposure.",
        "suggested_allocation": selected["alloc"],
        "top_picks": live_picks, # Now contains {symbol, price, change}
        "created_at": "2026-03-30T12:00:00Z",
        "is_read": False
    }