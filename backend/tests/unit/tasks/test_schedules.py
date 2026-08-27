import pytest
from app.workers.schedules import celery_beat_schedule
from app.workers.celery_app import celery_app


def test_beat_schedules_reference_real_registered_tasks():
    """All Celery Beat periodic schedules reference genuine registered tasks."""
    assert len(celery_beat_schedule) >= 3

    for schedule_name, config in celery_beat_schedule.items():
        task_name = config["task"]
        assert task_name in celery_app.tasks, (
            f"Schedule '{schedule_name}' references non-existent task '{task_name}'"
        )
        assert "schedule" in config
        assert "options" in config
        assert "queue" in config["options"]


def test_specific_schedules_configuration():
    """Verifies analytics, token cleanup, and stale job reconciliation schedules."""
    assert "daily-analytics-aggregation" in celery_beat_schedule
    analytics_cfg = celery_beat_schedule["daily-analytics-aggregation"]
    assert analytics_cfg["options"]["queue"] == "analytics"

    assert "cleanup-expired-tokens" in celery_beat_schedule
    assert "reconcile-stale-jobs" in celery_beat_schedule
