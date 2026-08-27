from dataclasses import dataclass
from typing import Dict, Optional, List
from app.core.config import get_settings

settings = get_settings()


@dataclass
class AIModelMetadata:
    model_name: str
    version: str
    path: str
    context_length: int
    is_active: bool
    quantization: str = "Q4_K_M"
    provider: str = "llama.cpp"


class AIModelRegistry:
    """
    Registry for active local LLM models and runtime capabilities.
    """

    def __init__(self):
        self._models: Dict[str, AIModelMetadata] = {
            settings.AI_MODEL_NAME: AIModelMetadata(
                model_name=settings.AI_MODEL_NAME,
                version=settings.AI_MODEL_VERSION,
                path=str(settings.AI_MODEL_PATH),
                context_length=settings.AI_CONTEXT_SIZE,
                is_active=True,
            )
        }

    def get_active_model(self) -> AIModelMetadata:
        return self._models[settings.AI_MODEL_NAME]

    def list_models(self) -> List[AIModelMetadata]:
        return list(self._models.values())


ai_model_registry = AIModelRegistry()
