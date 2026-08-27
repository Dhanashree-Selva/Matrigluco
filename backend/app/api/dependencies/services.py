from functools import lru_cache
from app.storage.base import StorageService
from app.storage.local import LocalStorageService
from app.ml.inference.predictor import MLInferenceService, model_registry
from app.cache.redis import redis_manager, RedisManager


@lru_cache()
def get_storage_service() -> StorageService:
    """Provides a singleton private LocalStorageService instance."""
    return LocalStorageService()


@lru_cache()
def get_ml_inference_service() -> MLInferenceService:
    """Provides a singleton MLInferenceService instance."""
    return MLInferenceService(registry=model_registry)


def get_redis_manager() -> RedisManager:
    """Provides the RedisManager instance."""
    return redis_manager
