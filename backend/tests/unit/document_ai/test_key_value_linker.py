import pytest
from app.document_ai.reconstruction.key_value_linker import KeyValueSpatialLinker
from app.document_ai.contracts.element import ParsedElement, ElementType, BoundingBox


def test_link_colon_separated_key_values():
    linker = KeyValueSpatialLinker()
    bbox = BoundingBox(x0=0.1, y0=0.2, x1=0.8, y1=0.4, page_number=1)

    elem1 = ParsedElement(
        element_id="elem_1",
        type=ElementType.PARAGRAPH,
        text="Fasting Blood Sugar: 94.5 mg/dL\nHbA1c: 5.4 %\nBlood Pressure: 118/78 mmHg",
        bbox=bbox,
    )

    results = linker.link_key_values([elem1])

    assert len(results) == 3
    assert results[0]["test_name"] == "Fasting Blood Sugar"
    assert results[0]["raw_value"] == "94.5"
    assert results[0]["raw_unit"] == "mg/dL"

    assert results[1]["test_name"] == "HbA1c"
    assert results[1]["raw_value"] == "5.4"

    assert results[2]["test_name"] == "Blood Pressure"
    assert results[2]["raw_value"] == "118/78"


def test_suppress_non_medical_labels():
    linker = KeyValueSpatialLinker()
    bbox = BoundingBox(x0=0.1, y0=0.1, x1=0.8, y1=0.2, page_number=1)

    elem = ParsedElement(
        element_id="elem_hdr",
        type=ElementType.HEADER,
        text="Phone: 9848022338\nAge: 29 Years\nSample ID: 849204",
        bbox=bbox,
    )

    results = linker.link_key_values([elem])
    assert len(results) == 0
