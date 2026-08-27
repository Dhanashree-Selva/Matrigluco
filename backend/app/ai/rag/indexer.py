import logging
from typing import List
from app.ai.rag.contracts import RAGChunk
from app.ai.rag.chunker import DocumentChunker

logger = logging.getLogger("matrigluco.ai.indexer")


class KnowledgeIndexer:
    """
    Coordinates document chunking and index population.
    """

    def __init__(self, chunker: DocumentChunker = None):
        self.chunker = chunker or DocumentChunker()
        self._indexed_chunks: List[RAGChunk] = []

    def index_document_text(self, document_id: str, text: str) -> List[RAGChunk]:
        chunks = self.chunker.split_text(document_id, text)
        self._indexed_chunks.extend(chunks)
        logger.info(f"Indexed {len(chunks)} chunks for document {document_id}")
        return chunks

    def get_all_chunks(self) -> List[RAGChunk]:
        return self._indexed_chunks
