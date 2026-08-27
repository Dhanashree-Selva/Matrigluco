from dataclasses import dataclass
from typing import Dict, Any, Optional
from app.document_ai.contracts.element import BoundingBox


@dataclass
class EvidenceSnippet:
    """Bounded, traceable evidence snippet for frontend Source Trace."""
    page_number: int
    bbox: BoundingBox
    raw_snippet: str
    surrounding_text: Optional[str] = None
    source_type: str = "native_pdf_text"  # native_pdf_text, native_pdf_table, ocr_layout, vlm_crop

    def to_dict(self) -> Dict[str, Any]:
        return {
            "page_number": self.page_number,
            "bbox": self.bbox.to_dict(),
            "raw_snippet": self.raw_snippet,
            "surrounding_text": self.surrounding_text,
            "source_type": self.source_type,
        }


@dataclass
class SourceProvenance:
    parser_name: str
    parser_version: str
    evidence: EvidenceSnippet
    confidence: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "parser_name": self.parser_name,
            "parser_version": self.parser_version,
            "confidence": round(self.confidence, 4),
            "evidence": self.evidence.to_dict(),
        }
