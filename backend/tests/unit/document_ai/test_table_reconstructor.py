import pytest
from app.document_ai.reconstruction.table_reconstructor import TableSemanticReconstructor
from app.document_ai.contracts.table import ParsedTable, ParsedTableRow, ParsedTableCell
from app.document_ai.contracts.element import BoundingBox


def test_reconstruct_table_with_headers():
    reconstructor = TableSemanticReconstructor()

    bbox = BoundingBox(x0=0.1, y0=0.2, x1=0.9, y1=0.6, page_number=1)
    headers = ["Investigation", "Observed Value", "Standard Unit", "Bio. Ref. Interval"]

    row1_cells = [
        ParsedTableCell(row=1, col=0, text="Fasting Blood Sugar", bbox=bbox),
        ParsedTableCell(row=1, col=1, text="92.0", bbox=bbox),
        ParsedTableCell(row=1, col=2, text="mg/dL", bbox=bbox),
        ParsedTableCell(row=1, col=3, text="70 - 99", bbox=bbox),
    ]
    row2_cells = [
        ParsedTableCell(row=2, col=0, text="Post Prandial Blood Sugar", bbox=bbox),
        ParsedTableCell(row=2, col=1, text="134.0", bbox=bbox),
        ParsedTableCell(row=2, col=2, text="mg/dL", bbox=bbox),
        ParsedTableCell(row=2, col=3, text="< 140", bbox=bbox),
    ]

    table = ParsedTable(
        table_id="tab_1",
        page_number=1,
        bbox=bbox,
        headers=headers,
        rows=[ParsedTableRow(row_index=1, cells=row1_cells), ParsedTableRow(row_index=2, cells=row2_cells)],
    )

    observations = reconstructor.reconstruct_table_observations(table)

    assert len(observations) == 2
    assert observations[0]["test_name"] == "Fasting Blood Sugar"
    assert observations[0]["raw_value"] == "92.0"
    assert observations[0]["raw_unit"] == "mg/dL"
    assert observations[0]["reference_range"] == "70 - 99"

    assert observations[1]["test_name"] == "Post Prandial Blood Sugar"
    assert observations[1]["raw_value"] == "134.0"
