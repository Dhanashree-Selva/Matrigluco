import uuid
from typing import List
from app.ai.rag.contracts import RAGChunk


class DocumentChunker:
    """
    Splits clinical guidance documents into sliding text chunks with overlap.
    """

    def __init__(self, chunk_size_words: int = 200, overlap_words: int = 40):
        self.chunk_size = chunk_size_words
        self.overlap = overlap_words

    def split_text(self, document_id: str, text: str) -> List[RAGChunk]:
        words = text.split()
        if not words:
            return []

        chunks: List[RAGChunk] = []
        step = max(1, self.chunk_size - self.overlap)

        for i in range(0, len(words), step):
            chunk_words = words[i : i + self.chunk_size]
            chunk_text = " ".join(chunk_words)
            chunks.append(
                RAGChunk(
                    chunk_id=str(uuid.uuid4()),
                    document_id=document_id,
                    text=chunk_text,
                    token_count=len(chunk_words),
                )
            )
            if i + self.chunk_size >= len(words):
                break

        return chunks
