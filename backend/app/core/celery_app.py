from celery import Celery
import os
from dotenv import load_dotenv
from celery.schedules import crontab

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery(
    "wealth_app",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.price_refresh"]
)

celery.conf.timezone = "Asia/Kolkata"
celery.conf.beat_schedule = {
    "evening-price-refresh": {
        "task": "app.tasks.price_refresh.refresh_all_prices",
        "schedule": crontab(hour=18, minute=00)
    }
}
