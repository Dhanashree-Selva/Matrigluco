import logging
import re
from abc import ABC, abstractmethod
from typing import List, Optional
from app.ai.rag.contracts import RAGChunk, RAGSearchResult
from app.ai.rag.clinical_guidelines import get_default_clinical_chunks

logger = logging.getLogger("matrigluco.ai.retriever")


class RAGRetriever(ABC):
    @abstractmethod
    def retrieve(self, query: str, top_k: int = 3) -> List[RAGSearchResult]:
        pass


class KeywordRAGRetriever(RAGRetriever):
    """
    Memory-resident semantic keyword matching retriever for maternal health & GDM clinical guidelines.
    """

    def __init__(self, chunks: Optional[List[RAGChunk]] = None):
        self.chunks = chunks if chunks is not None else get_default_clinical_chunks()

    def set_chunks(self, chunks: List[RAGChunk]):
        self.chunks = chunks

    def retrieve(self, query: str, top_k: int = 3) -> List[RAGSearchResult]:
        if not self.chunks:
            return []

        # Tokenize and extract alphanumeric keywords
        raw_tokens = re.findall(r"\b\w+\b", query.lower())
        stopwords = {
            "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or",
            "is", "are", "was", "were", "what", "how", "why", "when", "where",
            "my", "me", "i", "can", "should", "do", "does", "did", "please", "tell",
        }
        query_terms = {t for t in raw_tokens if t not in stopwords and len(t) > 1}
        if not query_terms:
            query_terms = set(raw_tokens)

        # Synonym expansion for common patient maternal queries
        expanded_terms = set(query_terms)
        synonyms = {
            "sugar": ["glucose", "glycemic", "postprandial", "fasting"],
            "sugars": ["glucose", "glycemic", "postprandial", "fasting"],
            "food": ["nutrition", "carbohydrates", "diet", "meal", "snack"],
            "diet": ["nutrition", "carbohydrate", "protein", "fiber", "meal"],
            "eat": ["nutrition", "carbohydrates", "diet", "meal"],
            "exercise": ["physical", "activity", "walk", "aerobic"],
            "walk": ["exercise", "physical", "activity", "postprandial"],
            "baby": ["fetal", "fetus", "macrosomia", "gestational"],
            "risk": ["screening", "ogtt", "assessment", "probability"],
            "score": ["risk", "probability", "assessment"],
            "reading": ["measurement", "telemetry", "glucose", "fasting"],
            "readings": ["measurements", "telemetry", "glucose", "fasting"],
            "target": ["reference", "range", "threshold", "mg/dl"],
            "targets": ["reference", "range", "threshold", "mg/dl"],
            "bp": ["pressure", "hypertension", "preeclampsia"],
            "pressure": ["blood", "hypertension", "preeclampsia"],
        }
        for term in query_terms:
            if term in synonyms:
                expanded_terms.update(synonyms[term])

        results: List[RAGSearchResult] = []

        for chunk in self.chunks:
            chunk_tokens = set(re.findall(r"\b\w+\b", chunk.text.lower()))
            intersection = expanded_terms.intersection(chunk_tokens)
            if intersection:
                score = len(intersection) / max(1, len(expanded_terms))
                results.append(RAGSearchResult(chunk=chunk, similarity_score=round(score, 4)))

        results.sort(key=lambda x: x.similarity_score, reverse=True)
        if not results:
            # Return top general guidance chunks if no direct term match
            return [RAGSearchResult(chunk=c, similarity_score=0.1) for c in self.chunks[:top_k]]

        return results[:top_k]
