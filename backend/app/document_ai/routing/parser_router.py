from enum import Enum
from typing import Dict, Any
from app.document_ai.contracts.page import PageType


class ParserRoute(str, Enum):
    NATIVE_ONLY = "NATIVE_ONLY"
    NATIVE_PLUS_TABLE = "NATIVE_PLUS_TABLE"
    LAYOUT_OCR = "LAYOUT_OCR"
    VLM_FALLBACK = "VLM_FALLBACK"


class ParserRouter:
    """
    Decides per-page routing:
    - BORN_DIGITAL -> NATIVE_PLUS_TABLE (PyMuPDF)
    - MIXED -> NATIVE_PLUS_TABLE with selective image OCR
    - SCANNED -> LAYOUT_OCR
    """

    def route_page(self, page_analysis: Dict[str, Any]) -> ParserRoute:
        page_type = page_analysis.get("page_type", PageType.BORN_DIGITAL)
        density = page_analysis.get("native_text_density", 0.0)

        if page_type == PageType.BORN_DIGITAL:
            return ParserRoute.NATIVE_PLUS_TABLE
        elif page_type == PageType.MIXED and density > 10.0:
            return ParserRoute.NATIVE_PLUS_TABLE
        elif page_type == PageType.SCANNED or page_type == PageType.IMAGE:
            return ParserRoute.LAYOUT_OCR
        else:
            return ParserRoute.NATIVE_PLUS_TABLE
