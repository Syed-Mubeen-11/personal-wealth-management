from celery import Celery
import os
from dotenv import load_dotenv
from celery.schedules import crontab

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

celery = Celery(
    "wealth_app",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.price_refresh"]   # IMPORTANT
)

celery.conf.timezone = "UTC"
celery.conf.beat_schedule = {
    "evening-price-refresh": {
        "task": "app.tasks.price_refresh.refresh_all_prices",
        "schedule": crontab(hour=18, minute=00)
    }
}