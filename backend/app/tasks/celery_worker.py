"""
Celery Nightly Refresh — updated for new architecture
Fetches prices → stores in market_prices → syncs all investments
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery("wealthapp", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.update(
    task_serializer="json", result_serializer="json",
    accept_content=["json"], timezone="UTC", enable_utc=True,
    beat_schedule={
        "nightly-price-refresh": {
            "task":     "app.tasks.celery_worker.nightly_price_refresh",
            "schedule": crontab(hour=22, minute=30),
        },
    },
)


@celery_app.task(name="app.tasks.celery_worker.nightly_price_refresh", bind=True, max_retries=3)
def nightly_price_refresh(self):
    import logging
    from app.core.database import SessionLocal
    from app.models.portfolio import Investment
    from app.services.market_data import fetch_prices_bulk
    from app.services.portfolio_service import upsert_market_price

    logger = logging.getLogger(__name__)
    logger.info("Nightly price refresh started")

    db = SessionLocal()
    updated = 0
    failed  = 0

    try:
        investments = db.query(Investment).filter(
            Investment.asset_type != "cash",
            Investment.units      >  0,
        ).all()

        symbols = list({inv.symbol for inv in investments})
        if not symbols:
            return {"updated": 0, "failed": 0}

        price_map = fetch_prices_bulk(symbols, delay_seconds=0.3)

        for symbol, pd in price_map.items():
            if pd and pd.get("price"):
                upsert_market_price(
                    db, symbol=symbol,
                    price=pd["price"],
                    change=pd.get("change", 0),
                    change_pct=pd.get("change_pct", 0),
                    source=pd.get("source", "yfinance"),
                )
                updated += 1
                logger.info(f"Updated {symbol}: ${pd['price']}")
            else:
                failed += 1

        db.commit()
        logger.info(f"Nightly refresh complete: {updated} updated, {failed} failed")
        return {"updated": updated, "failed": failed}

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=300)
    finally:
        db.close()
