from typing import Optional
from app.document_ai.contracts.evidence import EvidenceSnippet, SourceProvenance
from app.document_ai.contracts.element import BoundingBox


class EvidenceBuilder:
    """
    Constructs trace records connecting extracted medical candidates to specific document regions.
    """

    @staticmethod
    def build_provenance(
        page_number: int,
        bbox: BoundingBox,
        snippet: str,
        parser_name: str = "pymupdf",
        parser_version: str = "1.28.2",
        source_type: str = "native_pdf_text",
        confidence: float = 1.0,
    ) -> SourceProvenance:
        evidence = EvidenceSnippet(
            page_number=page_number,
            bbox=bbox,
            raw_snippet=snippet,
            source_type=source_type,
        )
        return SourceProvenance(
            parser_name=parser_name,
            parser_version=parser_version,
            evidence=evidence,
            confidence=confidence,
        )
