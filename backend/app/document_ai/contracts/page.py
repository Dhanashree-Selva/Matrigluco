from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any
from app.document_ai.contracts.element import ParsedElement
from app.document_ai.contracts.table import ParsedTable


class PageType(str, Enum):
    BORN_DIGITAL = "born_digital"
    SCANNED = "scanned"
    MIXED = "mixed"
    IMAGE = "image"
    BLANK = "blank"


@dataclass
class PageGeometry:
    width: float
    height: float
    rotation: int = 0
    dpi: int = 200


@dataclass
class ParsedPage:
    page_number: int
    geometry: PageGeometry
    page_type: PageType
    elements: List[ParsedElement] = field(default_factory=list)
    tables: List[ParsedTable] = field(default_factory=list)
    raw_text: str = ""
    native_text_density: float = 0.0
    image_count: int = 0
    confidence: float = 1.0
    parser_used: str = "pymupdf"
    metadata: Dict[str, Any] = field(default_factory=dict)
