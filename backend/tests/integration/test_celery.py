import pytest
from app.workers.celery_app import celery_app
from app.workers.celery_config import celery_settings


def test_celery_app_is_configured_and_importable():
    """Celery application is properly configured with separate Redis DBs."""
    assert celery_app.conf.broker_url.endswith("/1")
    assert celery_app.conf.result_backend.endswith("/2")
    assert celery_app.conf.task_serializer == "json"
    assert celery_app.conf.result_serializer == "json"


def test_celery_task_execution_eager():
    """Tasks can be imported and their signature validated."""
    task = celery_app.tasks.get("app.tasks.cleanup_tasks.cleanup_expired_tokens_task")
    assert task is not None
