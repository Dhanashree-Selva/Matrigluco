from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class KnowledgeDocResponse(BaseModel):
    id: str
    title: str
    document_type: str
    source_author: Optional[str] = None
    version: str
    total_chunks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KnowledgeChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    token_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
