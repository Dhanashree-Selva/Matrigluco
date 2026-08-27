import logging
from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.knowledge_repository import KnowledgeRepository
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_chunk import KnowledgeChunk
from app.schemas.knowledge import KnowledgeDocResponse, KnowledgeChunkResponse
from app.ai.knowledge.ingestion import KnowledgeIngestionPipeline
from app.ai.knowledge.metadata import KnowledgeDocumentMetadata

logger = logging.getLogger("matrigluco.services.knowledge")


class KnowledgeService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = KnowledgeRepository(db)
        self.pipeline = KnowledgeIngestionPipeline()

    def list_documents(self) -> List[KnowledgeDocResponse]:
        docs = self.repo.list_documents()
        return [KnowledgeDocResponse.model_validate(d) for d in docs]

    def ingest_text_document(
        self,
        title: str,
        document_type: str,
        content: str,
        source_author: Optional[str] = None,
        version: str = "1.0.0",
    ) -> KnowledgeDocResponse:
        doc = KnowledgeDocument(
            title=title,
            document_type=document_type,
            source_author=source_author,
            version=version,
        )
        saved_doc = self.repo.add_document(doc)

        # Chunk document
        chunks = self.pipeline.indexer.index_document_text(saved_doc.id, content)
        db_chunks = [
            KnowledgeChunk(
                document_id=saved_doc.id,
                chunk_index=idx,
                content=c.text,
                token_count=c.token_count,
            )
            for idx, c in enumerate(chunks)
        ]
        self.repo.add_chunks(db_chunks)

        saved_doc.total_chunks = len(db_chunks)
        self.db.commit()
        self.db.refresh(saved_doc)

        return KnowledgeDocResponse.model_validate(saved_doc)
