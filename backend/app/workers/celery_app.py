import logging
from celery import Celery
from app.workers.celery_config import celery_settings
from app.workers.schedules import celery_beat_schedule

logger = logging.getLogger("matrigluco.workers.celery")

# Create Celery application instance
celery_app = Celery("matrigluco")
celery_app.conf.update(celery_settings)
celery_app.conf.beat_schedule = celery_beat_schedule

# Auto-discover domain background tasks
celery_app.autodiscover_tasks(
    [
        "app.tasks.report_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.analytics_tasks",
        "app.tasks.export_tasks",
        "app.tasks.cleanup_tasks",
        "app.tasks.knowledge_tasks",
        "app.tasks.chatbot_tasks",
    ]
)

# Explicit imports to ensure immediate task registration
import app.tasks.report_tasks  # noqa: F401
import app.tasks.notification_tasks  # noqa: F401
import app.tasks.analytics_tasks  # noqa: F401
import app.tasks.export_tasks  # noqa: F401
import app.tasks.cleanup_tasks  # noqa: F401
import app.tasks.knowledge_tasks  # noqa: F401
import app.tasks.chatbot_tasks  # noqa: F401
