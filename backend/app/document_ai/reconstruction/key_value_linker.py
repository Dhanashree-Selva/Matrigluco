import re
from typing import List, Dict, Any, Optional
from app.document_ai.contracts.element import ParsedElement, ElementType
from app.document_ai.medical.terminology import ClinicalTerminologyRegistry


class KeyValueSpatialLinker:
    """
    Identifies non-table structured observations using:
    - Same-line colon / separator syntax: "Fasting Blood Sugar: 92.0 mg/dL"
    - Same-line space-separated syntax: "Fasting Blood Sugar 92.0 mg/dL"
    - Multi-line sequence pairing: Label on line 1, Value on line 2, Unit on line 3
    """

    KEY_VALUE_PATTERNS = [
        r"^([a-zA-Z0-9\s()/-]+?)\s*[:=]\s*([<>]?\s*[0-9.,]+(?:\s*/\s*[0-9.,]+)?)\s*([a-zA-Z/%µu\^]+.*)?$",
        r"^([a-zA-Z\s()/-]+?)\s+([<>]?\s*[0-9.,]+(?:\s*/\s*[0-9.,]+)?)\s*([a-zA-Z/%µu\^]+.*)?$",
    ]

    def __init__(self):
        self.terminology = ClinicalTerminologyRegistry()

    def link_key_values(self, elements: List[ParsedElement]) -> List[Dict[str, Any]]:
        observations: List[Dict[str, Any]] = []

        for elem in elements:
            text = elem.text.strip()
            if not text:
                continue

            lines = [line.strip() for line in text.split("\n") if line.strip()]
            i = 0
            while i < len(lines):
                cleaned_line = lines[i]

                # 1. Try single line patterns
                matched = False
                for pat in self.KEY_VALUE_PATTERNS:
                    match = re.match(pat, cleaned_line)
                    if match:
                        raw_key = match.group(1).strip()
                        raw_val = match.group(2).strip()
                        raw_unit = match.group(3).strip() if match.group(3) else None

                        if not self._is_non_medical_label(raw_key):
                            observations.append(
                                {
                                    "test_name": raw_key,
                                    "raw_value": raw_val,
                                    "raw_unit": raw_unit,
                                    "bbox": elem.bbox,
                                    "page_number": elem.bbox.page_number,
                                    "source_type": "native_pdf_text",
                                    "raw_line": cleaned_line,
                                }
                            )
                            matched = True
                            break

                if matched:
                    i += 1
                    continue

                # 2. Try multi-line sequence pairing (Line i is clinical concept label, Line i+1 is numeric)
                if i + 1 < len(lines):
                    concept = self.terminology.match_concept(cleaned_line)
                    if concept and not self._is_non_medical_label(cleaned_line):
                        next_line = lines[i + 1]
                        num_match = re.match(r"^([<>]?\s*[0-9.,]+(?:\s*/\s*[0-9.,]+)?)$", next_line)
                        if num_match:
                            raw_val = num_match.group(1).strip()
                            raw_unit = None
                            if i + 2 < len(lines) and re.match(r"^[a-zA-Z/%µu\^]+.*$", lines[i + 2]):
                                raw_unit = lines[i + 2]
                                i += 1  # consume unit line too

                            observations.append(
                                {
                                    "test_name": cleaned_line,
                                    "raw_value": raw_val,
                                    "raw_unit": raw_unit,
                                    "bbox": elem.bbox,
                                    "page_number": elem.bbox.page_number,
                                    "source_type": "native_pdf_text",
                                    "raw_line": f"{cleaned_line} {raw_val} {raw_unit or ''}".strip(),
                                }
                            )
                            i += 2
                            continue

                i += 1

        return observations

    def _is_non_medical_label(self, label: str) -> bool:
        lower = label.lower()
        ignore_words = [
            "phone", "tel", "fax", "mobile", "contact",
            "age", "sex", "gender", "page", "date", "time",
            "id", "mrn", "doctor", "physician", "hospital",
            "lab", "clinic", "address", "sample", "barcode",
            "bill", "invoice", "receipt", "printed",
        ]
        return any(lower.startswith(w) or lower == w for w in ignore_words)
