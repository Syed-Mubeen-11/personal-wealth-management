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


@celery.task
def refresh_all_prices():

    db = SessionLocal()

    investments = db.query(Investment).all()

    for inv in investments:

        price = fetch_stock_price(inv.symbol)

        if price:
            inv.last_price = price
            inv.current_value = price * float(inv.units)
            inv.last_price_at = datetime.utcnow()

        time.sleep(12)

    db.commit()
    db.close()