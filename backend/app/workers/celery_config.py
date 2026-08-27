"""
Centralized Celery Configuration for MatriGluco.

Queues:
- 'reports': CPU-intensive OCR, parsing, report generation, and exports.
- 'notifications': Asynchronous email and in-app message delivery.
- 'analytics': Scheduled aggregations and trend calculations.
- 'default': General maintenance, cleanup, and background tasks.
"""

from kombu import Queue
from app.core.config import get_settings

settings = get_settings()

celery_settings = {
    # Broker and Result Backend (Separated Logical DBs)
    "broker_url": settings.CELERY_BROKER_URL,  # Redis DB /1
    "result_backend": settings.CELERY_RESULT_BACKEND,  # Redis DB /2
    # Serialization (JSON only, no unsafe pickle)
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    # Timezone & Execution Defaults
    "timezone": "UTC",
    "enable_utc": True,
    "task_track_started": True,
    "result_expires": 3600,  # 1 hour short result expiry (MySQL is authoritative)
    "task_time_limit": 30 * 60,  # 30 minutes hard timeout
    "task_soft_time_limit": 28 * 60,  # 28 minutes soft timeout
    "broker_connection_retry_on_startup": True,
    "worker_prefetch_multiplier": 1,
    # Defined Queues
    "task_queues": (
        Queue("default", routing_key="default.#"),
        Queue("reports", routing_key="reports.#"),
        Queue("notifications", routing_key="notifications.#"),
        Queue("analytics", routing_key="analytics.#"),
    ),
    "task_default_queue": "default",
    # Explicit Task Routing
    "task_routes": {
        "app.tasks.report_tasks.*": {"queue": "reports"},
        "app.tasks.export_tasks.*": {"queue": "reports"},
        "app.tasks.notification_tasks.*": {"queue": "notifications"},
        "app.tasks.analytics_tasks.*": {"queue": "analytics"},
        "app.tasks.cleanup_tasks.*": {"queue": "default"},
        "app.tasks.knowledge_tasks.*": {"queue": "default"},
        "app.tasks.chatbot_tasks.*": {"queue": "default"},
    },
}
