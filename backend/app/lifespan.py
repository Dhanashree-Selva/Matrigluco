import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.engine import dispose_engine
from app.cache.client import redis_manager
from app.ml.inference.model_loader import ml_model_loader

logger = logging.getLogger("matrigluco.lifespan")
settings = get_settings()


def ensure_storage_structure() -> None:
    """Ensures private, AI, and generated storage directories exist."""
    directories = [
        settings.STORAGE_ROOT / "private" / "medical-reports",
        settings.STORAGE_ROOT / "private" / "avatars",
        settings.STORAGE_ROOT / "private" / "knowledge-documents",
        settings.STORAGE_ROOT / "ai" / "models",
        settings.STORAGE_ROOT / "ai" / "indexes",
        settings.STORAGE_ROOT / "generated" / "exports",
        settings.STORAGE_ROOT / "temp",
    ]
    for d in directories:
        d.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def application_lifespan(app: FastAPI):
    """
    FastAPI Application Lifespan Manager.
    Manages process startup, shared resource initialization, and graceful shutdown.
    """
    # ── Startup Phase ─────────────────────────────────────────────────────────
    log_fmt = "json" if settings.LOG_JSON else "text"
    setup_logging(log_level=settings.LOG_LEVEL, log_format=log_fmt)
    logger.info(f"Initializing {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    logger.info(f"Database: {settings.database_url_safe}")

    # Ensure private storage hierarchy exists
    ensure_storage_structure()

    # Preload Clinical ML Model (tabular diabetes risk model)
    if settings.ML_PRELOAD:
        try:
            ml_model_loader.get_model_and_scaler(settings.ML_MODEL_KEY, settings.ML_MODEL_VERSION)
            logger.info(
                f"Clinical ML Model [{settings.ML_MODEL_KEY}:{settings.ML_MODEL_VERSION}] preloaded successfully."
            )
        except Exception as e:
            logger.warning(f"ML Model preload notice: {e}")

    # Optional local AI chatbot preloading
    if settings.AI_ENABLED and settings.AI_PRELOAD_MODEL:
        try:
            from app.ai.runtime.llama_runtime import get_ai_runtime

            runtime = get_ai_runtime()
            runtime.load_model()
            logger.info("Local AI Chatbot GGUF model preloaded into process memory.")
        except Exception as e:
            logger.warning(f"AI Model preload notice (will lazy-load on demand): {e}")

    yield

    # ── Shutdown Phase ────────────────────────────────────────────────────────
    logger.info("Executing graceful application shutdown...")
    dispose_engine()
    redis_manager.close()
    logger.info("Application shutdown complete.")
