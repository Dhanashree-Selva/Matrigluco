import os
import logging
from typing import Dict, Any
from app.core.config import get_settings
from app.db.healthcheck import check_database_connection
from app.cache.client import check_redis_health
from app.ai.runtime.runtime_health import check_ai_runtime_health
from app.ml.inference.model_loader import ml_model_loader

logger = logging.getLogger("matrigluco.observability.health")
settings = get_settings()


def check_storage_health() -> Dict[str, Any]:
    """Checks whether private storage directories are configured and accessible."""
    try:
        storage_path = settings.PRIVATE_STORAGE_PATH
        os.makedirs(storage_path, exist_ok=True)
        # Test write capability safely
        test_file = os.path.join(storage_path, ".health_probe")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        return {"status": "accessible", "writable": True}
    except Exception as e:
        logger.warning(f"Storage health probe failed: {e}")
        return {"status": "inaccessible", "writable": False}


def check_ml_runtime_health() -> Dict[str, Any]:
    """Checks whether the tabular diabetes risk prediction artifacts are present."""
    try:
        model, scaler, meta = ml_model_loader.get_model_and_scaler(
            "diabetes-risk", settings.DIABETES_MODEL_VERSION
        )
        return {
            "status": "ready",
            "model_version": settings.DIABETES_MODEL_VERSION,
            "algorithm": meta.get("algorithm", "LogisticRegression"),
        }
    except Exception as e:
        logger.warning(f"ML runtime health probe failed: {e}")
        return {
            "status": "unavailable",
            "model_version": settings.DIABETES_MODEL_VERSION,
            "error": "Model artifact not loaded",
        }


def get_system_readiness_status() -> Dict[str, Any]:
    """
    Comprehensive system readiness aggregator.
    Evaluates Database, Redis, Storage, ML, and local AI runtime.
    """
    db_ok = check_database_connection()
    redis_ok = check_redis_health()
    storage_info = check_storage_health()
    ml_info = check_ml_runtime_health()
    ai_info = check_ai_runtime_health()

    redis_required = getattr(settings, "REDIS_REQUIRED", False)
    is_ready = db_ok and storage_info.get("writable", False)
    if redis_required and not redis_ok:
        is_ready = False

    return {
        "status": "ready" if is_ready else "degraded",
        "dependencies": {
            "database": {
                "status": "connected" if db_ok else "unreachable",
                "required": True,
                "authoritative": True,
            },
            "redis": {
                "status": "connected" if redis_ok else "unreachable",
                "required": redis_required,
                "transient": True,
            },
            "storage": {
                "status": storage_info.get("status", "unknown"),
                "required": True,
            },
            "ml": {
                "status": ml_info.get("status", "unknown"),
                "required": True,
                "version": ml_info.get("model_version"),
            },
            "ai": {
                "status": ai_info.get("status", "disabled"),
                "enabled": ai_info.get("enabled", False),
                "required": False,
            },
        },
    }
