from typing import Tuple
from app.document_ai.contracts.extraction import SupportedConcept, ValidationStatus, ExtractionCandidate
from app.document_ai.medical.schema import CONCEPT_DEFINITIONS


class MedicalValueValidator:
    """
    Deterministic validation for extracted medical candidates:
    - Checks numeric ranges against broad biological plausibility boundaries.
    - Validates unit compatibility.
    """

    def validate_candidate(self, candidate: ExtractionCandidate) -> ValidationStatus:
        concept = candidate.concept
        definition = CONCEPT_DEFINITIONS.get(concept)
        if not definition:
            return ValidationStatus.VALID

        val = candidate.normalized_value

        # Dual BP validation (e.g. "118/78")
        if concept == SupportedConcept.BLOOD_PRESSURE and isinstance(val, str) and "/" in val:
            try:
                sys_str, dia_str = val.split("/")
                sys_num = float(sys_str.strip())
                dia_num = float(dia_str.strip())
                if sys_num < 60.0 or sys_num > 260.0 or dia_num < 30.0 or dia_num > 160.0:
                    return ValidationStatus.PLAUSIBILITY_WARNING
                return ValidationStatus.VALID
            except ValueError:
                return ValidationStatus.SYNTAX_ERROR

        # Numeric range validation
        if isinstance(val, (int, float)):
            p_min = definition.get("plausible_min", 0.0)
            p_max = definition.get("plausible_max", 9999.0)

            if val < p_min or val > p_max:
                return ValidationStatus.PLAUSIBILITY_WARNING

        # Unit validation
        allowed_units = definition.get("allowed_units", [])
        if candidate.normalized_unit and allowed_units:
            if not any(candidate.normalized_unit.lower() == u.lower() for u in allowed_units):
                return ValidationStatus.INVALID_UNIT

        return ValidationStatus.VALID
