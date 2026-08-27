import logging
from pathlib import Path
from typing import List, Union
import pymupdf

from app.document_ai.contracts.document import DocumentClass
from app.document_ai.contracts.page import PageType

logger = logging.getLogger("matrigluco.document_ai.classifier")


class DocumentClassifier:
    """
    Determines document class (BORN_DIGITAL_PDF, SCANNED_PDF, MIXED_PDF, IMAGE)
    based on native stream inspection, text densities, and visual image layers.
    """

    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp"}

    def classify_file(self, file_path: Union[str, Path], mime_type: str = "") -> DocumentClass:
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix in self.IMAGE_EXTENSIONS or "image" in mime_type.lower():
            return DocumentClass.IMAGE

        if suffix == ".pdf" or "pdf" in mime_type.lower():
            return self._classify_pdf(path)

        return DocumentClass.UNKNOWN

    def _classify_pdf(self, pdf_path: Path) -> DocumentClass:
        try:
            doc = pymupdf.open(str(pdf_path))
            if len(doc) == 0:
                doc.close()
                return DocumentClass.UNKNOWN

            digital_pages = 0
            scanned_pages = 0

            for page in doc:
                text = page.get_text("text").strip()
                images = page.get_images()

                # Text density heuristic
                char_count = len(text)
                if char_count > 80:
                    digital_pages += 1
                elif char_count == 0 and len(images) > 0:
                    scanned_pages += 1
                elif char_count < 80 and len(images) > 0:
                    scanned_pages += 1
                else:
                    digital_pages += 1

            doc.close()

            if scanned_pages == 0:
                return DocumentClass.BORN_DIGITAL_PDF
            elif digital_pages == 0:
                return DocumentClass.SCANNED_PDF
            else:
                return DocumentClass.MIXED_PDF
        except Exception as e:
            logger.warning(f"PDF classification failed for '{pdf_path}': {e}")
            return DocumentClass.SCANNED_PDF
