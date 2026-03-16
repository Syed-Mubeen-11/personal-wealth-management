import os
import sqlite3
import requests
import time
from dotenv import load_dotenv

load_dotenv()

def get_price_alpha_vantage(symbol, api_key):
    """Get current stock price from Alpha Vantage API"""
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": api_key
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            price = float(data["Global Quote"]["05. price"])
            return price
        else:
            print(f"❌ {symbol}: API Error - {data}")
            return None
    except Exception as e:
        print(f"❌ {symbol}: Request failed - {e}")
        return None

def main():
    # 1. CONNECT DATABASE
    print("📊 Connecting to database...")
    conn = sqlite3.connect('../users.db')
    cursor = conn.cursor()
    
    # 2. FETCH ALL ASSETS
    cursor.execute("SELECT id, symbol, quantity FROM assets")
    assets = cursor.fetchall()
    
    if not assets:
        print("⚠️ No assets found in database")
        conn.close()
        return
    
    print(f"📈 Found {len(assets)} assets to update")
    
    # 3. GET API KEY
    ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY") or os.getenv("ALPHA_VANTAGE_API_KEY")
    
    if not ALPHA_VANTAGE_KEY:
        print("❌ Alpha Vantage API key missing from .env file!")
        print("Add to .env: ALPHA_VANTAGE_KEY=your_key_here")
        print("or: ALPHA_VANTAGE_API_KEY=your_key_here")
        conn.close()
        return
    
    print("🔑 Using Alpha Vantage (production)")
    
    # 4. UPDATE PRICES WITH RATE LIMITING
    success_count = 0
    for asset_id, symbol, quantity in assets:
        print(f"⏳ Fetching {symbol}...")
        
        price = get_price_alpha_vantage(symbol, ALPHA_VANTAGE_KEY)
        
        if price:
            current_value = price * quantity
            cursor.execute("""
                UPDATE assets 
                SET current_value=?, last_price=?, last_price_at=CURRENT_TIMESTAMP 
                WHERE id=?
            """, (current_value, price, asset_id))
            
            print(f"✅ {symbol}: ${price:.2f} (Total: ${current_value:.2f})")
            success_count += 1
        else:
            print(f"❌ {symbol}: Failed to fetch price")
        
        # Alpha Vantage: 5 calls/min = 12s between calls
        if success_count < len(assets):  
            print("⏳ Waiting 12s (API rate limit)...")
            time.sleep(12)
    
    # 5. COMMIT & CLOSE
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Update complete! {success_count}/{len(assets)} assets updated")
    print("💾 Database saved to users.db")

if __name__ == "__main__":
    main()
