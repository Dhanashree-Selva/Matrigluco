import logging
from pathlib import Path
from typing import List
from app.ai.knowledge.metadata import KnowledgeDocumentMetadata
from app.ai.knowledge.document_loader import DocumentLoader
from app.ai.rag.indexer import KnowledgeIndexer
from app.ai.rag.contracts import RAGChunk

logger = logging.getLogger("matrigluco.ai.ingestion")


class KnowledgeIngestionPipeline:
    """
    Orchestrates the ingestion, chunking, and indexing of approved maternal health guidelines.
    """

    def __init__(self, loader: DocumentLoader = None, indexer: KnowledgeIndexer = None):
        self.loader = loader or DocumentLoader()
        self.indexer = indexer or KnowledgeIndexer()

    def ingest_file(self, file_path: Path, metadata: KnowledgeDocumentMetadata) -> List[RAGChunk]:
        logger.info(f"Ingesting guideline document: '{metadata.title}' from {file_path}")
        raw_text = self.loader.load_text_file(file_path)
        chunks = self.indexer.index_document_text(metadata.document_id, raw_text)
        metadata.total_chunks = len(chunks)
        return chunks
