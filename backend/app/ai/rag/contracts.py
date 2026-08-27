from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class RAGChunk:
    chunk_id: str
    document_id: str
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    token_count: int = 0


@dataclass
class RAGSearchResult:
    chunk: RAGChunk
    similarity_score: float
