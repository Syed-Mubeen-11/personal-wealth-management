from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Auto-discover tasks
celery_app.autodiscover_tasks(["tasks"])

# Celery Beat schedule (Nightly task)
celery_app.conf.beat_schedule = {
    "nightly-market-refresh": {
        "task": "tasks.market_tasks.nightly_refresh",
        "schedule": 50.0,  # every 10 seconds
        # "schedule": 60.0 * 60 * 24,  # every 24 hours
    },
}


celery_app.conf.timezone = "Asia/Kolkata"
import tasks.market_tasks