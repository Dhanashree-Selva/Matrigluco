from typing import Dict, Any
from app.core.config import get_settings
from app.ai.runtime.model_loader import AIModelLoader
from app.ai.runtime.llama_runtime import get_ai_runtime

settings = get_settings()


def check_ai_runtime_health() -> Dict[str, Any]:
    """
    Evaluates offline AI chatbot runtime readiness. Never leaks absolute disk paths.
    """
    if not settings.AI_ENABLED:
        return {
            "enabled": False,
            "status": "disabled",
            "model_name": settings.AI_MODEL_NAME,
            "message": "AI Chatbot is disabled in configuration.",
        }

    loader = AIModelLoader()
    model_exists = loader.is_model_available()
    runtime = get_ai_runtime()

    return {
        "enabled": True,
        "status": "ready",
        "model_name": settings.AI_MODEL_NAME,
        "version": settings.AI_MODEL_VERSION,
        "is_loaded": runtime.is_loaded(),
        "model_file_present": model_exists,
        "provider": "llama_cpp",
    }
