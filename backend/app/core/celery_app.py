from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "wealth_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# FIX: Update the path to the tasks module
celery_app.conf.imports = ['app.services.tasks'] 

celery_app.conf.update(
    task_track_started=True,
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

# Celery Beat schedule for automated tasks
celery_app.conf.beat_schedule = {
    # Nightly refresh task - runs every day at 1:00 AM UTC
    # This updates current_value for all user investments
    'nightly-price-refresh': {
        'task': 'app.services.tasks.refresh_all_asset_prices',
        'schedule': crontab(hour=1, minute=0),
        'options': {'queue': 'default'}
    },
    # Optional: Additional refresh at market close (4:30 PM EST = 9:30 PM UTC)
    'market-close-refresh': {
        'task': 'app.services.tasks.refresh_all_asset_prices',
        'schedule': crontab(hour=21, minute=30),
        'options': {'queue': 'default'}
    },
}