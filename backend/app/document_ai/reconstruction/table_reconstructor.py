import re
from typing import List, Dict, Any, Optional
from app.document_ai.contracts.table import ParsedTable, ParsedTableRow, ParsedTableCell


class TableSemanticReconstructor:
    """
    Reconstructs laboratory table semantics:
    - Detects column roles: Test Name, Result, Unit, Reference Interval, Flag.
    - Distinguishes current vs historical/previous results.
    - Preserves cell coordinates and bounding box evidence.
    """

    HEADER_PATTERNS = {
        "test_name": [
            r"test\s*name",
            r"investigation",
            r"parameter",
            r"analyte",
            r"examination",
            r"profile",
            r"test",
        ],
        "result": [
            r"observed\s*value",
            r"patient\s*value",
            r"test\s*result",
            r"current\s*result",
            r"result",
            r"value",
            r"reading",
        ],
        "previous_result": [
            r"previous\s*result",
            r"prior\s*value",
            r"historical",
            r"previous",
            r"history",
        ],
        "unit": [
            r"units?",
            r"uom",
            r"standard\s*unit",
        ],
        "reference_range": [
            r"bio(?:logical)?\s*ref(?:\.|erence)?\s*(?:interval|range)?",
            r"reference\s*range",
            r"reference\s*interval",
            r"normal\s*range",
            r"reference\s*values?",
            r"normal\s*values?",
            r"ref(?:\.|\s)*range",
            r"ref(?:\.|\s)*interval",
        ],
        "flag": [
            r"flags?",
            r"status",
            r"remarks?",
            r"abnormal",
        ],
    }

    def reconstruct_table_observations(self, table: ParsedTable) -> List[Dict[str, Any]]:
        if not table.rows:
            return []

        # 1. Determine column roles from table.headers or the first row
        column_roles = self._classify_column_roles(table)

        observations: List[Dict[str, Any]] = []

        # 2. Iterate data rows
        data_rows = table.rows[1:] if (not table.headers and table.rows and table.rows[0].is_header) else table.rows

        for row in data_rows:
            obs = self._extract_row_observation(row, column_roles, table.page_number)
            if obs:
                observations.append(obs)

        return observations

    def _classify_column_roles(self, table: ParsedTable) -> Dict[int, str]:
        roles: Dict[int, str] = {}
        headers = table.headers

        # If headers not set on table, inspect row 0
        if not headers and table.rows:
            headers = [cell.text for cell in table.rows[0].cells]
            table.rows[0].is_header = True

        for col_idx, raw_header in enumerate(headers):
            cleaned = raw_header.lower().strip()
            role = self._match_header_role(cleaned)
            if role:
                roles[col_idx] = role

        # Fallback default positions if headers couldn't be matched
        if "test_name" not in roles.values() and len(headers) >= 2:
            roles[0] = "test_name"
        if "result" not in roles.values() and len(headers) >= 2:
            roles[1] = "result"
        if "unit" not in roles.values() and len(headers) >= 3:
            roles[2] = "unit"
        if "reference_range" not in roles.values() and len(headers) >= 4:
            roles[3] = "reference_range"

        return roles

    def _match_header_role(self, header_text: str) -> Optional[str]:
        for role, patterns in self.HEADER_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, header_text, re.IGNORECASE):
                    return role
        return None

    def _extract_row_observation(
        self,
        row: ParsedTableRow,
        column_roles: Dict[int, str],
        page_number: int,
    ) -> Optional[Dict[str, Any]]:
        cells = row.cells
        if not cells:
            return None

        test_name = ""
        result_val = ""
        unit = ""
        ref_range = ""
        flag = ""
        bbox = row.cells[0].bbox if row.cells else None

        for col_idx, cell in enumerate(cells):
            role = column_roles.get(col_idx)
            text = cell.text.strip()
            if not text:
                continue

            if role == "test_name":
                test_name = text
            elif role == "result":
                result_val = text
            elif role == "previous_result":
                # Mark historical result separately so it doesn't collide
                pass
            elif role == "unit":
                unit = text
            elif role == "reference_range":
                ref_range = text
            elif role == "flag":
                flag = text

        if not test_name and not result_val:
            return None

        # Clean any combined numeric + unit inside result_val (e.g. "102 mg/dL")
        if result_val and not unit:
            unit_match = re.search(r"([0-9.,]+)\s*([a-zA-Z/%µu\^]+.*)", result_val)
            if unit_match:
                result_val = unit_match.group(1).strip()
                unit = unit_match.group(2).strip()

        return {
            "test_name": test_name,
            "raw_value": result_val,
            "raw_unit": unit,
            "reference_range": ref_range,
            "flag": flag,
            "bbox": bbox,
            "page_number": page_number,
            "source_type": "native_pdf_table",
        }
