from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional


@dataclass
class KnowledgeDocumentMetadata:
    document_id: str
    title: str
    document_type: str  # guideline, clinical_faq, nutritional_guidance
    source_author: str
    version: str
    total_chunks: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    extra: Dict[str, Any] = field(default_factory=dict)
