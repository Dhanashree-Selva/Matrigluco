from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, Any, List


class ElementType(str, Enum):
    HEADING = "heading"
    PARAGRAPH = "paragraph"
    LABEL = "label"
    VALUE = "value"
    TABLE = "table"
    TABLE_CELL = "table_cell"
    HEADER = "header"
    FOOTER = "footer"
    CAPTION = "caption"
    IMAGE = "image"
    UNKNOWN = "unknown"


@dataclass
class BoundingBox:
    """Normalized bounding box coordinates [0.0 - 1.0] relative to page dimensions."""
    x0: float
    y0: float
    x1: float
    y1: float
    page_number: int = 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "x0": round(self.x0, 4),
            "y0": round(self.y0, 4),
            "x1": round(self.x1, 4),
            "y1": round(self.y1, 4),
            "page_number": self.page_number,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BoundingBox":
        return cls(
            x0=float(data.get("x0", 0.0)),
            y0=float(data.get("y0", 0.0)),
            x1=float(data.get("x1", 0.0)),
            y1=float(data.get("y1", 0.0)),
            page_number=int(data.get("page_number", 1)),
        )


@dataclass
class ParsedElement:
    """Individual geometric text/layout element on a page."""
    element_id: str
    type: ElementType
    text: str
    bbox: BoundingBox
    confidence: float = 1.0
    reading_order: int = 0
    font_name: Optional[str] = None
    font_size: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
