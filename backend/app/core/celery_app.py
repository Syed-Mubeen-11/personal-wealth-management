from celery import Celery

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