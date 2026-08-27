import re
from typing import Tuple, Any, Optional
from app.document_ai.contracts.extraction import ValueComparator


class MedicalValueParser:
    """
    Parses clinical numeric values with exact comparator retention (<5, >200, 120/80, 5,200).
    """

    COMPARATOR_MAP = {
        "<=": ValueComparator.LTE,
        ">=": ValueComparator.GTE,
        "<": ValueComparator.LT,
        ">": ValueComparator.GT,
    }

    def parse_value(self, raw_value_str: str) -> Tuple[Any, ValueComparator]:
        cleaned = str(raw_value_str).strip()

        # Dual Blood Pressure value e.g. "120/80" or "118 / 78"
        bp_match = re.match(r"^([0-9]{2,3})\s*/\s*([0-9]{2,3})$", cleaned)
        if bp_match:
            sys_val = int(bp_match.group(1))
            dia_val = int(bp_match.group(2))
            return f"{sys_val}/{dia_val}", ValueComparator.EQ

        comparator = ValueComparator.EQ
        for comp_str, comp_enum in self.COMPARATOR_MAP.items():
            if cleaned.startswith(comp_str):
                comparator = comp_enum
                cleaned = cleaned[len(comp_str):].strip()
                break

        # Remove thousands commas: "1,250" -> "1250"
        cleaned_no_commas = cleaned.replace(",", "")

        # Match decimal or integer
        num_match = re.search(r"^[0-9]+(?:\.[0-9]+)?", cleaned_no_commas)
        if num_match:
            val_str = num_match.group(0)
            if "." in val_str:
                return float(val_str), comparator
            else:
                return int(val_str), comparator

        return cleaned, comparator
