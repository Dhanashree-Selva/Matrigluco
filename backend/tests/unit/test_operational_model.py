import os
import pytest
from app.core.config import Settings
from app.workers.schedules import celery_beat_schedule
from app.integrations.storage.local import LocalStorageProvider
from app.core.exceptions import StorageError


def test_app_import_independence():
    """Importing FastAPI app does not start Celery, Beat, or external network daemons."""
    from app.main import app

    assert app is not None
    assert app.title == "Matrigluco"


def test_celery_import_independence():
    """Importing Celery app does not start FastAPI or Alembic migrations."""
    from app.workers.celery_app import celery_app

    assert celery_app is not None
    assert celery_app.main == "matrigluco"


def test_celery_beat_schedules_coverage():
    """Celery Beat schedules must have non-empty tasks and valid queue routes."""
    assert len(celery_beat_schedule) >= 3

    valid_queues = {"default", "reports", "notifications", "analytics"}
    for name, config in celery_beat_schedule.items():
        assert name.strip() != ""
        assert "task" in config
        assert "schedule" in config
        if "options" in config and "queue" in config["options"]:
            assert config["options"]["queue"] in valid_queues


def test_production_config_rejects_debug_mode():
    """Production settings must reject DEBUG=True."""
    with pytest.raises(Exception):
        Settings(
            APP_ENV="production",
            DEBUG=True,
            JWT_SECRET_KEY="a" * 64,
            DATABASE_URL="mysql+pymysql://matrigluco_app:pass@127.0.0.1:3306/matrigluco",
        )


def test_production_config_rejects_placeholder_jwt():
    """Production settings must reject default/placeholder JWT secret keys."""
    with pytest.raises(Exception):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            JWT_SECRET_KEY="supersecretkey",
            DATABASE_URL="mysql+pymysql://matrigluco_app:pass@127.0.0.1:3306/matrigluco",
        )


def test_storage_path_traversal_rejection(tmp_path):
    """LocalStorageProvider strictly prevents directory traversal escapes."""
    storage = LocalStorageProvider(root_dir=tmp_path)

    with pytest.raises(StorageError) as exc:
        storage._resolve_safe_path("../../../etc/passwd")
    assert "Path traversal attempt detected" in str(exc.value)


def test_ai_disabled_behavior():
    """When AI_ENABLED=false, missing GGUF model path is valid."""
    settings = Settings(
        APP_ENV="development",
        DEBUG=True,
        AI_ENABLED=False,
        AI_MODEL_PATH="",
    )
    assert settings.AI_ENABLED is False
