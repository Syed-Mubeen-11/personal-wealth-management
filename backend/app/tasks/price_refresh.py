from app.core.celery_app import celery
from app.core.database import SessionLocal
from app.models.user import User
from app.models.goals import Goal
from app.models.investments import Investment
from app.models.transactions import Transaction
from datetime import datetime
from app.services.asset_price import get_asset_price


@celery.task
def refresh_all_prices():
    print(f"[{datetime.utcnow()}] Starting price refresh task...")
    db = SessionLocal()

    try:
        investments = db.query(Investment).all()
        print(f"Found {len(investments)} investments to update.")
        
        updated_count = 0
        failed_count = 0

        for inv in investments:
            try:
                print(f"Fetching price for {inv.symbol} ({inv.asset_type})...")
                price = get_asset_price(inv.symbol, inv.asset_type)
                
                if price and price > 0:
                    inv.last_price = price
                    inv.current_value = price * float(inv.units)
                    inv.last_price_at = datetime.utcnow()
                    print(f"✅ Updated {inv.symbol}: New Price = ₹{price}")
                    updated_count += 1
                else:
                    print(f"⚠️ Warning: Could not fetch price for {inv.symbol}")
                    failed_count += 1
                    
            except Exception as e:
                print(f"❌ Error updating {inv.symbol}: {str(e)}")
                failed_count += 1

        db.commit()
        print(f"[{datetime.utcnow()}] Price refresh completed.")
        print(f"✅ Updated: {updated_count} | ❌ Failed: {failed_count}")
        
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        db.rollback()
    finally:
        db.close()

    return {
        "status": "completed",
        "updated": updated_count,
        "failed": failed_count,
        "timestamp": datetime.utcnow().isoformat()
    }