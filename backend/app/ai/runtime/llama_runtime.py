import time
import logging
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import get_settings
from app.core.exceptions import InfrastructureError
from app.ai.runtime.generation import GenerationParams, GenerationResult
from app.ai.runtime.model_loader import AIModelLoader

logger = logging.getLogger("matrigluco.ai.runtime")
settings = get_settings()


class LLMRuntime(ABC):
    """
    Abstract interface for local LLM inference engines.
    """

    @abstractmethod
    def load_model(self) -> None:
        pass

    @abstractmethod
    def generate(self, prompt: str, params: Optional[GenerationParams] = None) -> GenerationResult:
        pass

    @abstractmethod
    def stream_generate(self, prompt: str, params: Optional[GenerationParams] = None):
        pass

    @abstractmethod
    def is_loaded(self) -> bool:
        pass


class LlamaCppRuntime(LLMRuntime):
    """
    Production local LLM execution engine wrapping llama-cpp-python (GGUF).
    Connects directly to llama_cpp.Llama with dynamic generation and token streaming.
    """

    def __init__(self, loader: Optional[AIModelLoader] = None):
        self.loader = loader or AIModelLoader()
        self._llm = None

    def is_loaded(self) -> bool:
        return self._llm is not None

    def load_model(self) -> None:
        if not settings.AI_ENABLED:
            logger.debug("AI runtime loading skipped (AI_ENABLED=false).")
            return

        if self._llm is not None:
            return

        if not self.loader.is_model_available():
            raise InfrastructureError(
                message=f"Local GGUF model file not found at '{self.loader.model_path}'. Please provide a valid model file.",
                code="AI_MODEL_NOT_FOUND",
            )

        try:
            from llama_cpp import Llama  # type: ignore
        except ImportError as e:
            raise InfrastructureError(
                message=f"llama-cpp-python is not installed: {e}",
                code="LLAMA_CPP_NOT_INSTALLED",
            )

        model_path = self.loader.get_resolved_path()
        logger.info(f"Loading GGUF model from {model_path} into memory...")

        try:
            self._llm = Llama(
                model_path=str(model_path),
                n_ctx=settings.AI_CONTEXT_SIZE,
                n_gpu_layers=settings.AI_GPU_LAYERS,
                n_threads=settings.AI_THREADS,
                verbose=False,
            )
            logger.info("Local GGUF model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load GGUF model from {model_path}: {e}")
            self._llm = None
            raise InfrastructureError(
                message=f"Failed to load local GGUF model: {e}",
                code="AI_MODEL_LOAD_FAILED",
            )

    def generate(self, prompt: str, params: Optional[GenerationParams] = None) -> GenerationResult:
        if not self.is_loaded():
            self.load_model()

        if self._llm is None:
            raise InfrastructureError(
                message="Local LLM model is not loaded.",
                code="AI_MODEL_NOT_LOADED",
            )

        cfg = params or GenerationParams(
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS,
            temperature=settings.AI_TEMPERATURE,
            top_p=settings.AI_TOP_P,
            top_k=settings.AI_TOP_K,
            repeat_penalty=1.18,
        )

        start_time = time.perf_counter()
        output = self._llm(
            prompt=prompt,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
            top_p=cfg.top_p,
            top_k=cfg.top_k,
            repeat_penalty=cfg.repeat_penalty,
            stop=cfg.stop_sequences,
            echo=False,
        )
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        text = output["choices"][0]["text"].strip()
        tokens_used = output.get("usage", {}).get("completion_tokens", 0)
        finish_reason = output["choices"][0].get("finish_reason", "stop")

        return GenerationResult(
            text=text,
            tokens_generated=tokens_used,
            finish_reason=finish_reason,
            latency_ms=round(elapsed_ms, 2),
            model_name=settings.AI_MODEL_NAME,
        )

    def stream_generate(self, prompt: str, params: Optional[GenerationParams] = None):
        if not self.is_loaded():
            self.load_model()

        if self._llm is None:
            raise InfrastructureError(
                message="Local LLM model is not loaded.",
                code="AI_MODEL_NOT_LOADED",
            )

        cfg = params or GenerationParams(
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS,
            temperature=settings.AI_TEMPERATURE,
            top_p=settings.AI_TOP_P,
            top_k=settings.AI_TOP_K,
            repeat_penalty=1.18,
        )

        stream = self._llm(
            prompt=prompt,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
            top_p=cfg.top_p,
            top_k=cfg.top_k,
            repeat_penalty=cfg.repeat_penalty,
            stop=cfg.stop_sequences,
            stream=True,
            echo=False,
        )
        for chunk in stream:
            token = chunk["choices"][0].get("text", "")
            if token:
                yield token


# Global singleton instance
_ai_runtime_instance: Optional[LLMRuntime] = None


def get_ai_runtime() -> LLMRuntime:
    """Returns singleton LLMRuntime instance."""
    global _ai_runtime_instance
    if _ai_runtime_instance is None:
        _ai_runtime_instance = LlamaCppRuntime()
    return _ai_runtime_instance
