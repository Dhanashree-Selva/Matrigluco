import re
from typing import List, Set
from app.document_ai.contracts.element import ParsedElement, ElementType


class SectionBuilder:
    """
    Suppresses recurring headers, footers, hospital contact info, and disclaimers
    so they cannot accidentally be recognized as laboratory values.
    """

    RECURRING_HEADER_PATTERNS = [
        r"page\s*\d+\s*(?:of|/)\s*\d+",
        r"hospital|laboratory|diagnostic|pathology|clinic",
        r"authorized\s*signatory|medical\s*director|pathologist",
        r"end\s*of\s*report|clinical\s*interpretation|disclaimer",
        r"telephone|email|website|accredited|iso\s*\d+",
    ]

    def filter_noise_elements(self, elements: List[ParsedElement]) -> List[ParsedElement]:
        clean_elements: List[ParsedElement] = []

        for elem in elements:
            # Check bounding box position: top 8% of page or bottom 8% of page
            if elem.bbox.y0 < 0.08 or elem.bbox.y1 > 0.92:
                # If text matches header/footer pattern, mark as header/footer
                if self._matches_noise_pattern(elem.text):
                    elem.type = ElementType.HEADER if elem.bbox.y0 < 0.08 else ElementType.FOOTER
                    continue

            clean_elements.append(elem)

        return clean_elements

    def _matches_noise_pattern(self, text: str) -> bool:
        lower = text.lower()
        for pat in self.RECURRING_HEADER_PATTERNS:
            if re.search(pat, lower, re.IGNORECASE):
                return True
        return False
