"""
Celery Beat Periodic Schedules Configuration for MatriGluco.

Single Scheduler Rule:
Runs as one supervised Celery Beat instance in production.
All scheduled tasks must be idempotent against duplicate triggering.
"""

from celery.schedules import crontab

celery_beat_schedule = {
    # 1. Daily patient analytics & trend aggregation (Runs daily at 00:05 UTC)
    "daily-analytics-aggregation": {
        "task": "app.tasks.analytics_tasks.generate_daily_analytics_task",
        "schedule": crontab(hour=0, minute=5),
        "options": {"queue": "analytics"},
    },
    # 2. Expired authentication & refresh token cleanup (Runs hourly at minute 0)
    "cleanup-expired-tokens": {
        "task": "app.tasks.cleanup_tasks.cleanup_expired_tokens_task",
        "schedule": crontab(minute=0),
        "options": {"queue": "default"},
    },
    # 3. Stale background job reconciliation (Runs every 15 minutes)
    "reconcile-stale-jobs": {
        "task": "app.tasks.cleanup_tasks.reconcile_stale_jobs_task",
        "schedule": crontab(minute="*/15"),
        "options": {"queue": "default"},
    },
}
