import hashlib
import logging
import time
from pathlib import Path
from typing import Union, List, Dict, Any
import pymupdf

from app.document_ai.contracts.document import (
    ParsedDocument,
    DocumentClass,
    DocumentMetadata,
)
from app.document_ai.contracts.page import ParsedPage, PageGeometry, PageType
from app.document_ai.contracts.element import ParsedElement, ElementType, BoundingBox
from app.document_ai.contracts.table import ParsedTable, ParsedTableRow, ParsedTableCell
from app.document_ai.parsers.base import BaseDocumentParser
from app.document_ai.routing.page_classifier import PageClassifier

logger = logging.getLogger("matrigluco.document_ai.pymupdf")


class PyMuPDFDocumentParser(BaseDocumentParser):
    """
    High-performance native PDF parser:
    - Extracts structured text blocks with normalized coordinates [0.0 - 1.0]
    - Extracts embedded tables using PyMuPDF native table detection
    - Preserves reading order and font geometries
    """

    def __init__(self):
        self.page_classifier = PageClassifier()

    @property
    def name(self) -> str:
        return "pymupdf"

    @property
    def version(self) -> str:
        return pymupdf.__version__

    def parse_file(self, file_path: Union[str, Path]) -> ParsedDocument:
        start_time = time.time()
        path = Path(file_path)

        with open(path, "rb") as f:
            file_bytes = f.read()
            checksum = hashlib.sha256(file_bytes).hexdigest()

        doc = pymupdf.open(str(path))
        page_count = len(doc)

        metadata = DocumentMetadata(
            file_name=path.name,
            file_size_bytes=len(file_bytes),
            mime_type="application/pdf",
            sha256_checksum=checksum,
            page_count=page_count,
        )

        parsed_pages: List[ParsedPage] = []
        total_elements = 0
        total_tables = 0

        for page_idx, page in enumerate(doc):
            page_num = page_idx + 1
            rect = page.rect
            width = max(1.0, rect.width)
            height = max(1.0, rect.height)

            analysis = self.page_classifier.classify_page(page)
            page_type = analysis["page_type"]

            geometry = PageGeometry(
                width=width,
                height=height,
                rotation=int(page.rotation),
            )

            elements: List[ParsedElement] = []
            tables: List[ParsedTable] = []

            # 1. Extract Native Tables via PyMuPDF Table Finder
            try:
                table_finder = page.find_tables()
                for t_idx, tab in enumerate(table_finder.tables):
                    t_bbox_raw = tab.bbox  # (x0, y0, x1, y1)
                    norm_bbox = BoundingBox(
                        x0=max(0.0, min(1.0, t_bbox_raw[0] / width)),
                        y0=max(0.0, min(1.0, t_bbox_raw[1] / height)),
                        x1=max(0.0, min(1.0, t_bbox_raw[2] / width)),
                        y1=max(0.0, min(1.0, t_bbox_raw[3] / height)),
                        page_number=page_num,
                    )

                    headers = [str(h or "").strip() for h in (tab.header.names if tab.header else [])]
                    parsed_rows: List[ParsedTableRow] = []

                    for r_idx, row_cells in enumerate(tab.extract()):
                        cell_objs: List[ParsedTableCell] = []
                        for c_idx, cell_val in enumerate(row_cells):
                            cell_text = str(cell_val or "").strip()
                            cell_objs.append(
                                ParsedTableCell(
                                    row=r_idx,
                                    col=c_idx,
                                    text=cell_text,
                                    bbox=norm_bbox,
                                    is_header=(r_idx == 0 and not headers),
                                )
                            )
                        parsed_rows.append(ParsedTableRow(row_index=r_idx, cells=cell_objs))

                    tables.append(
                        ParsedTable(
                            table_id=f"tab_p{page_num}_{t_idx+1}",
                            page_number=page_num,
                            bbox=norm_bbox,
                            headers=headers,
                            rows=parsed_rows,
                        )
                    )
            except Exception as e:
                logger.debug(f"PyMuPDF table detection skipped on page {page_num}: {e}")

            # 2. Extract Text Blocks with Coordinates
            blocks = page.get_text("blocks") or []
            reading_order = 0
            full_page_text_parts = []

            for b_idx, block in enumerate(blocks):
                # (x0, y0, x1, y1, text, block_no, block_type)
                if len(block) < 5:
                    continue
                bx0, by0, bx1, by1, btext = block[0], block[1], block[2], block[3], block[4]
                block_type_num = block[6] if len(block) > 6 else 0

                if block_type_num != 0:
                    # Non-text block (e.g. image block)
                    continue

                cleaned_text = btext.strip()
                if not cleaned_text:
                    continue

                full_page_text_parts.append(cleaned_text)

                norm_block_bbox = BoundingBox(
                    x0=max(0.0, min(1.0, bx0 / width)),
                    y0=max(0.0, min(1.0, by0 / height)),
                    x1=max(0.0, min(1.0, bx1 / width)),
                    y1=max(0.0, min(1.0, by1 / height)),
                    page_number=page_num,
                )

                elem_type = ElementType.PARAGRAPH
                if len(cleaned_text) < 40 and not cleaned_text.endswith("."):
                    elem_type = ElementType.LABEL

                elements.append(
                    ParsedElement(
                        element_id=f"elem_p{page_num}_{b_idx+1}",
                        type=elem_type,
                        text=cleaned_text,
                        bbox=norm_block_bbox,
                        reading_order=reading_order,
                    )
                )
                reading_order += 1

            raw_page_text = "\n\n".join(full_page_text_parts)

            parsed_pages.append(
                ParsedPage(
                    page_number=page_num,
                    geometry=geometry,
                    page_type=page_type,
                    elements=elements,
                    tables=tables,
                    raw_text=raw_page_text,
                    native_text_density=analysis["native_text_density"],
                    image_count=analysis["image_count"],
                    parser_used="pymupdf",
                )
            )

            total_elements += len(elements)
            total_tables += len(tables)

        doc.close()

        duration_ms = (time.time() - start_time) * 1000.0

        return ParsedDocument(
            document_id=f"doc_{checksum[:12]}",
            document_class=DocumentClass.BORN_DIGITAL_PDF,
            metadata=metadata,
            pages=parsed_pages,
            pipeline_version="document_ai_v2.0",
            total_elements=total_elements,
            total_tables=total_tables,
            processing_duration_ms=round(duration_ms, 2),
        )
