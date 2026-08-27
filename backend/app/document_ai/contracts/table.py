from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from app.document_ai.contracts.element import BoundingBox


@dataclass
class ParsedTableCell:
    row: int
    col: int
    text: str
    bbox: BoundingBox
    row_span: int = 1
    col_span: int = 1
    confidence: float = 1.0
    is_header: bool = False


@dataclass
class ParsedTableRow:
    row_index: int
    cells: List[ParsedTableCell] = field(default_factory=list)
    is_header: bool = False


@dataclass
class ParsedTable:
    table_id: str
    page_number: int
    bbox: BoundingBox
    headers: List[str] = field(default_factory=list)
    rows: List[ParsedTableRow] = field(default_factory=list)
    confidence: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
