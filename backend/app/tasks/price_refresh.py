from app.core.celery_app import celery
from app.core.database import SessionLocal
# IMPORTANT: import models so SQLAlchemy relationships resolve
from app.models.user import User
from app.models.goals import Goal
from app.models.investments import Investment
from app.models.transactions import Transaction
from datetime import datetime
import time
from app.services.alpha_vantage import fetch_stock_price
from app.services.asset_price import get_asset_price


@celery.task
def refresh_all_prices():
    print(f"[{datetime.utcnow()}] Starting nightly price refresh task...")
    db = SessionLocal()

    investments = db.query(Investment).all()
    print(f"Found {len(investments)} investments to update.")

    for inv in investments:
        try:
            print(f"Fetching price for {inv.symbol} ({inv.asset_type})...")
            price = get_asset_price(inv.symbol, inv.asset_type)
            
            if price:
                inv.last_price = price
                inv.current_value = price * float(inv.units)
                inv.last_price_at = datetime.utcnow()
                print(f"Updated {inv.symbol}: New Price = {price}")
            else:
                print(f"Warning: Could not fetch price for {inv.symbol}")
        except Exception as e:
            print(f"Error updating {inv.symbol}: {str(e)}")

        # Delay to avoid rate limits
        time.sleep(12)

    db.commit()
    print(f"[{datetime.utcnow()}] Price refresh task completed.")
    db.close()