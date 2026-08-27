import logging
from pathlib import Path
from typing import Optional
from app.core.config import get_settings
from app.core.exceptions import InfrastructureError

logger = logging.getLogger("matrigluco.ai.loader")
settings = get_settings()


class AIModelLoader:
    """
    Resolves, validates, and manages local GGUF model files on disk.
    """

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = Path(model_path or settings.AI_MODEL_PATH).resolve()

    def is_model_available(self) -> bool:
        """Returns True if GGUF model file exists on disk."""
        return self.model_path.exists() and self.model_path.is_file()

    def get_resolved_path(self) -> Path:
        """Returns verified absolute model path or raises error."""
        if not self.is_model_available():
            raise InfrastructureError(
                message=f"Local GGUF model file not found at '{self.model_path}'.",
                code="AI_MODEL_NOT_FOUND",
            )
        return self.model_path
