import pytest
from app.document_ai.medical.candidate_extractor import MedicalCandidateExtractor
from app.document_ai.contracts.document import ParsedDocument, DocumentClass, DocumentMetadata
from app.document_ai.contracts.page import ParsedPage, PageGeometry, PageType
from app.document_ai.contracts.table import ParsedTable, ParsedTableRow, ParsedTableCell
from app.document_ai.contracts.element import BoundingBox
from app.document_ai.contracts.extraction import SupportedConcept, ValidationStatus


def test_extract_medical_candidates_from_table():
    extractor = MedicalCandidateExtractor()
    bbox = BoundingBox(x0=0.1, y0=0.2, x1=0.9, y1=0.6, page_number=1)

    table = ParsedTable(
        table_id="tab_1",
        page_number=1,
        bbox=bbox,
        headers=["Test Name", "Result", "Units", "Reference Range"],
        rows=[
            ParsedTableRow(
                row_index=1,
                cells=[
                    ParsedTableCell(row=1, col=0, text="Fasting Blood Sugar", bbox=bbox),
                    ParsedTableCell(row=1, col=1, text="92.0", bbox=bbox),
                    ParsedTableCell(row=1, col=2, text="mg/dL", bbox=bbox),
                    ParsedTableCell(row=1, col=3, text="70-99", bbox=bbox),
                ],
            ),
            ParsedTableRow(
                row_index=2,
                cells=[
                    ParsedTableCell(row=2, col=0, text="HbA1c", bbox=bbox),
                    ParsedTableCell(row=2, col=1, text="5.4", bbox=bbox),
                    ParsedTableCell(row=2, col=2, text="%", bbox=bbox),
                    ParsedTableCell(row=2, col=3, text="4.0-5.6", bbox=bbox),
                ],
            ),
        ],
    )

    page = ParsedPage(
        page_number=1,
        geometry=PageGeometry(width=612, height=792),
        page_type=PageType.BORN_DIGITAL,
        elements=[],
        tables=[table],
    )

    doc = ParsedDocument(
        document_id="doc_1",
        document_class=DocumentClass.BORN_DIGITAL_PDF,
        metadata=DocumentMetadata("test.pdf", 1000, "application/pdf", "abc", 1),
        pages=[page],
    )

    candidates = extractor.extract_candidates(doc)

    assert len(candidates) == 2
    fbs = next(c for c in candidates if c.concept == SupportedConcept.FASTING_GLUCOSE)
    assert fbs.normalized_value == 92.0
    assert fbs.normalized_unit == "mg/dL"
    assert fbs.validation_status == ValidationStatus.VALID

    hba1c = next(c for c in candidates if c.concept == SupportedConcept.HBA1C)
    assert hba1c.normalized_value == 5.4
    assert hba1c.normalized_unit == "%"
