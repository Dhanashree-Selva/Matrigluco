from typing import List
from app.ai.rag.contracts import RAGSearchResult


class SimilarityRanker:
    """Ranks and filters retrieved chunks by similarity score threshold."""

    def __init__(self, min_score: float = 0.30):
        self.min_score = min_score

    def rank_results(self, results: List[RAGSearchResult], top_k: int = 3) -> List[RAGSearchResult]:
        filtered = [r for r in results if r.similarity_score >= self.min_score]
        sorted_results = sorted(filtered, key=lambda x: x.similarity_score, reverse=True)
        return sorted_results[:top_k]
