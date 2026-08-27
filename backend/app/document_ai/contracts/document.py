from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any
from app.document_ai.contracts.page import ParsedPage


class DocumentClass(str, Enum):
    BORN_DIGITAL_PDF = "BORN_DIGITAL_PDF"
    SCANNED_PDF = "SCANNED_PDF"
    MIXED_PDF = "MIXED_PDF"
    IMAGE = "IMAGE"
    UNKNOWN = "UNKNOWN"


@dataclass
class DocumentMetadata:
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_checksum: str
    page_count: int
    created_at: Optional[str] = None


@dataclass
class ParsedDocument:
    document_id: str
    document_class: DocumentClass
    metadata: DocumentMetadata
    pages: List[ParsedPage] = field(default_factory=list)
    pipeline_version: str = "document_ai_v2.0"
    total_elements: int = 0
    total_tables: int = 0
    processing_duration_ms: float = 0.0
    extra_data: Dict[str, Any] = field(default_factory=dict)
