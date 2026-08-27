import re
from typing import Optional
from app.document_ai.contracts.extraction import SupportedConcept
from app.document_ai.medical.schema import CONCEPT_DEFINITIONS


class UnitNormalizer:
    """
    Standardizes clinical unit strings while retaining the raw string for auditability.
    """

    UNIT_REPLACEMENTS = {
        r"mg\s*/\s*d[lL]": "mg/dL",
        r"mmol\s*/\s*[lL]": "mmol/L",
        r"%\s*(?:percent)?": "%",
        r"mm\s*hg": "mmHg",
        r"kg\s*/\s*m\s*\^?\s*2|kg\s*/\s*sq\s*m": "kg/m²",
        r"[µu]iu\s*/\s*m[lL]|miu\s*/\s*[lL]": "µIU/mL",
        r"10\s*\^?\s*3\s*/\s*[µu]l|thou\s*/\s*[µu]l|lakhs?\s*/\s*cumm|cells?\s*/\s*cumm": "10³/µL",
        r"g\s*/\s*d[lL]": "g/dL",
    }

    def normalize_unit(self, raw_unit: Optional[str], concept: SupportedConcept) -> Optional[str]:
        if not raw_unit:
            # Return canonical concept unit as default if concept is known
            definition = CONCEPT_DEFINITIONS.get(concept)
            return definition.get("canonical_unit") if definition else None

        cleaned = raw_unit.strip().lower()

        for pat, norm in self.UNIT_REPLACEMENTS.items():
            if re.search(rf"\b{pat}\b", cleaned):
                return norm

        return raw_unit.strip()
