import os
from unittest.mock import patch, MagicMock
import pytest
from app.core.config import Settings, get_settings
from app.observability.health import (
    get_system_readiness_status,
    check_storage_health,
    check_ml_runtime_health,
)
from app.ai.runtime.runtime_health import check_ai_runtime_health

settings = get_settings()


def test_celery_app_is_importable_independently():
    """Celery application must be importable without starting FastAPI server."""
    from app.workers.celery_app import celery_app

    assert celery_app is not None
    assert celery_app.main == "matrigluco"
    assert (
        "app.tasks.report_tasks.process_medical_report_task" in celery_app.tasks
        or "app.tasks.report_tasks.process_medical_report" in celery_app.tasks
    )


def test_fastapi_app_is_importable_independently():
    """FastAPI application must be importable without Celery worker running."""
    from app.main import app

    assert app is not None
    assert app.title in ["Matrigluco", "MatriGluco", "MatriGluco API", settings.APP_NAME]


def test_ai_disabled_health_status():
    """When AI_ENABLED=false, runtime health reports status='disabled' without error."""
    with patch("app.ai.runtime.runtime_health.settings.AI_ENABLED", False):
        health = check_ai_runtime_health()
        assert health["enabled"] is False
        assert health["status"] == "disabled"
        assert "message" in health


def test_ai_enabled_missing_model_health_status():
    """When AI_ENABLED=true and model file is missing, health reports 'model_missing' gracefully."""
    with patch("app.ai.runtime.runtime_health.settings.AI_ENABLED", True):
        with patch(
            "app.ai.runtime.model_loader.AIModelLoader.is_model_available", return_value=False
        ):
            with patch("app.ai.runtime.llama_runtime.get_ai_runtime") as mock_runtime:
                mock_runtime.return_value.is_loaded.return_value = False
                health = check_ai_runtime_health()
                assert health["enabled"] is True
                assert health["status"] == "model_missing"
                assert health["model_file_present"] is False


def test_storage_health_probe_success():
    """Verifies storage health probe writes and cleans up test probe in private storage."""
    res = check_storage_health()
    assert res["status"] == "accessible"
    assert res["writable"] is True


def test_ml_runtime_health_probe_success():
    """Verifies ML health probe reports tabular risk model status."""
    res = check_ml_runtime_health()
    assert res["status"] == "ready"
    assert "model_version" in res
    assert res["algorithm"] == "LogisticRegression"


def test_system_readiness_probe_structure():
    """Verifies system readiness aggregation with distinct dependencies."""
    readiness = get_system_readiness_status()
    assert "status" in readiness
    assert "dependencies" in readiness
    deps = readiness["dependencies"]
    assert "database" in deps
    assert "redis" in deps
    assert "storage" in deps
    assert "ml" in deps
    assert "ai" in deps
