from dotenv import load_dotenv
import os, requests, yfinance as yf, time, sqlite3
from datetime import datetime

load_dotenv()


def get_alpha_vantage_key() -> str:
    """Read Alpha Vantage API key from either supported env variable name."""
    return (
        os.getenv('ALPHA_VANTAGE_KEY')
        or os.getenv('ALPHA_VANTAGE_API_KEY')
        or ''
    )

def get_price(symbol: str):
    """Alpha Vantage → Yahoo Finance fallback"""
    alpha_key = get_alpha_vantage_key()

    if alpha_key and alpha_key != 'demo':
        try:
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={alpha_key}"
            data = requests.get(url).json()
            return float(data["Global Quote"]["05. price"])
        except:
            print(f"Alpha failed for {symbol}, using Yahoo")
    
    ticker = yf.Ticker(symbol)
    return float(ticker.info.get('regularMarketPrice', ticker.info.get('previousClose', 0)))

def update_all_assets():
    """Update assets table (SQLite version)"""
    db_path = '../users.db'  # From backend/app/services/ → root
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get assets with symbols
        cursor.execute("SELECT id, symbol FROM assets WHERE symbol IS NOT NULL")
        assets = cursor.fetchall()
        
        print(f"📊 Updating {len(assets)} assets...")
        
        for asset_id, symbol in assets:
            price = get_price(symbol)
            if price > 0:
                cursor.execute("""
                    UPDATE assets 
                    SET current_value = ?, 
                        last_price = ?, 
                        last_price_at = ? 
                    WHERE id = ?
                """, (price, price, datetime.now().isoformat(), asset_id))
                
                print(f"✅ {symbol}: ${price:.2f}")
                time.sleep(12)  # Alpha Vantage rate limit
        
        conn.commit()
        print("🎉 Market sync complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

# Keep your working function too
def update_prices():  # For backward compatibility
    update_all_assets()
