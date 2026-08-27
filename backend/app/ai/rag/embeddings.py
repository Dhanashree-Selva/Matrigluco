import logging
from abc import ABC, abstractmethod
from typing import List

logger = logging.getLogger("matrigluco.ai.embeddings")


class EmbeddingProvider(ABC):
    """Abstract interface for local offline vector embedding providers."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass


class LocalSentenceTransformersEmbeddingProvider(EmbeddingProvider):
    """
    Local embedding generator using sentence-transformers (e.g. all-MiniLM-L6-v2).
    """

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer  # type: ignore

                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                logger.warning(f"Could not load sentence-transformers: {e}")
        return self._model

    def embed_text(self, text: str) -> List[float]:
        model = self._get_model()
        if model:
            return model.encode(text).tolist()
        return [0.0] * 384

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        model = self._get_model()
        if model:
            return model.encode(texts).tolist()
        return [[0.0] * 384 for _ in texts]
