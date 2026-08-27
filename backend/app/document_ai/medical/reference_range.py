import re
from typing import Optional, Dict, Any


class ReferenceRangeParser:
    """
    Parses laboratory reference intervals and isolates them from patient measured values.
    """

    RANGE_PATTERNS = [
        r"([0-9]+(?:\.[0-9]+)?)\s*[-–—to]+\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z/%µu\^]+.*)?",
        r"([<>]=?)\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z/%µu\^]+.*)?",
    ]

    def parse_reference_range(self, raw_range_str: Optional[str]) -> Optional[Dict[str, Any]]:
        if not raw_range_str:
            return None

        cleaned = raw_range_str.strip()
        if not cleaned:
            return None

        for pat in self.RANGE_PATTERNS:
            match = re.search(pat, cleaned)
            if match:
                if len(match.groups()) == 3 and not match.group(1).startswith(("<", ">")):
                    return {
                        "raw": cleaned,
                        "low": float(match.group(1)),
                        "high": float(match.group(2)),
                        "unit": match.group(3).strip() if match.group(3) else None,
                    }
                else:
                    return {
                        "raw": cleaned,
                        "comparator": match.group(1),
                        "threshold": float(match.group(2)),
                        "unit": match.group(3).strip() if match.group(3) else None,
                    }

        return {"raw": cleaned}
