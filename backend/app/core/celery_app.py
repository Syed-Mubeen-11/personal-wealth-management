from celery import Celery
import os
from dotenv import load_dotenv
from celery.schedules import crontab

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

REDIS_URL = os.getenv("REDIS_URL")

celery = Celery(
    "wealth_app",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks.price_refresh"]   # IMPORTANT
)

celery.conf.timezone = "Asia/Kolkata"
celery.conf.beat_schedule = {
    "evening-price-refresh": {
        "task": "app.tasks.price_refresh.refresh_all_prices",
        "schedule": crontab(hour=18, minute=00)
    }
}