from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_chunk import KnowledgeChunk


class KnowledgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_document(self, doc: KnowledgeDocument) -> KnowledgeDocument:
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def list_documents(self) -> List[KnowledgeDocument]:
        stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_document(self, doc_id: str) -> Optional[KnowledgeDocument]:
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == doc_id)
        return self.db.scalars(stmt).first()

    def add_chunks(self, chunks: List[KnowledgeChunk]) -> List[KnowledgeChunk]:
        self.db.add_all(chunks)
        self.db.commit()
        return chunks

    def get_chunks(self, doc_id: str) -> List[KnowledgeChunk]:
        stmt = (
            select(KnowledgeChunk)
            .where(KnowledgeChunk.document_id == doc_id)
            .order_by(KnowledgeChunk.chunk_index.asc())
        )
        return list(self.db.scalars(stmt).all())
