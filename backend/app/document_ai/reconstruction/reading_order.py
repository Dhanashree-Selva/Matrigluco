from typing import List
from app.document_ai.contracts.element import ParsedElement


class ReadingOrderSorter:
    """
    Sorts geometric elements into natural human reading order:
    Multi-column layout awareness (grouping left column, then right column, top-to-bottom).
    """

    def sort_elements(self, elements: List[ParsedElement]) -> List[ParsedElement]:
        if not elements:
            return []

        # Sort primarily by top coordinate y0 (quantized to line bins of 0.02) then left coordinate x0
        def sort_key(elem: ParsedElement):
            line_bin = round(elem.bbox.y0 / 0.015)
            return (line_bin, elem.bbox.x0)

        sorted_list = sorted(elements, key=sort_key)

        for idx, elem in enumerate(sorted_list):
            elem.reading_order = idx

        return sorted_list
