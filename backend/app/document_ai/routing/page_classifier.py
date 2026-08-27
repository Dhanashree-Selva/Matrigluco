import string
from typing import Dict, Any
import pymupdf
from app.document_ai.contracts.page import PageType


class PageClassifier:
    """
    Evaluates individual page characteristics (text density, glyph ratios, image counts)
    to classify each page deterministically.
    """

    def classify_page(self, page: pymupdf.Page) -> Dict[str, Any]:
        text = page.get_text("text") or ""
        char_count = len(text)
        word_count = len(text.split())
        images = page.get_images() or []
        image_count = len(images)

        # Printable ASCII / Latin character ratio check (filters garbage binary glyphs)
        printable_count = sum(1 for c in text if c in string.printable)
        printable_ratio = (printable_count / char_count) if char_count > 0 else 0.0

        rect = page.rect
        page_area = max(1.0, rect.width * rect.height)
        native_text_density = char_count / (page_area / 10000.0)  # chars per 100x100 pt area

        if char_count == 0 and image_count == 0:
            page_type = PageType.BLANK
        elif char_count >= 80 and printable_ratio > 0.85:
            page_type = PageType.BORN_DIGITAL
        elif char_count > 0 and image_count > 0:
            page_type = PageType.MIXED
        elif image_count > 0:
            page_type = PageType.SCANNED
        else:
            page_type = PageType.BORN_DIGITAL if char_count > 0 else PageType.SCANNED

        return {
            "page_type": page_type,
            "char_count": char_count,
            "word_count": word_count,
            "image_count": image_count,
            "printable_ratio": round(printable_ratio, 4),
            "native_text_density": round(native_text_density, 4),
        }
