import pytest
from app.workers.celery_config import celery_settings
from app.workers.celery_app import celery_app


def test_celery_queue_definitions():
    """Celery application defines the 4 canonical queues with JSON serialization."""
    queues = celery_settings.get("task_queues", ())
    queue_names = [q.name for q in queues]

    assert "default" in queue_names
    assert "reports" in queue_names
    assert "notifications" in queue_names
    assert "analytics" in queue_names

    assert celery_settings["task_serializer"] == "json"
    assert celery_settings["result_serializer"] == "json"
    assert celery_settings["accept_content"] == ["json"]


def test_celery_task_routes_mapping():
    """Task routes direct report, notification, and analytics tasks to their dedicated queues."""
    routes = celery_settings.get("task_routes", {})

    assert routes.get("app.tasks.report_tasks.*") == {"queue": "reports"}
    assert routes.get("app.tasks.export_tasks.*") == {"queue": "reports"}
    assert routes.get("app.tasks.notification_tasks.*") == {"queue": "notifications"}
    assert routes.get("app.tasks.analytics_tasks.*") == {"queue": "analytics"}
    assert routes.get("app.tasks.cleanup_tasks.*") == {"queue": "default"}


def test_registered_tasks_discoverable():
    """All domain task functions are registered with Celery app."""
    tasks = celery_app.tasks
    assert "app.tasks.report_tasks.process_medical_report_task" in tasks
    assert "app.tasks.notification_tasks.dispatch_notification_task" in tasks
    assert "app.tasks.analytics_tasks.generate_daily_analytics_task" in tasks
    assert "app.tasks.cleanup_tasks.cleanup_expired_tokens_task" in tasks
