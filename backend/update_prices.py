import os
import time
import yfinance as yf
from dotenv import load_dotenv
import sqlite3

load_dotenv()

def get_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        price = stock.history(period="1d")['Close'].iloc[-1]
        return float(price)
    except:
        return 0

def update_prices():
    db_path = '../users.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol FROM assets")
        assets = cursor.fetchall()
        
        print(f"📊 Found {len(assets)} assets")
        
        for asset_id, symbol in assets:
            price = get_price(symbol)
            if price > 0:
                cursor.execute("""
                    UPDATE assets 
                    SET current_value = ?, 
                        last_price = ?, 
                        last_price_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (price, price, asset_id))
                print(f"✅ {symbol}: ${price:.2f}")
                time.sleep(1)
        
        conn.commit()
        print("🎉 All prices updated!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_prices()
