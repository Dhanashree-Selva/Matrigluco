import re
from typing import Tuple

PRESCRIPTION_PATTERNS = [
    r"take\s*\d+\s*mg",
    r"inject\s*\d+\s*units",
    r"prescribe",
    r"dosage:\s*\d+",
]


def validate_model_output(generated_text: str) -> Tuple[bool, str]:
    """
    Validates model output to prevent hallucinated drug dosage prescribing.
    Returns (is_valid, sanitized_text).
    """
    for pattern in PRESCRIPTION_PATTERNS:
        if re.search(pattern, generated_text, re.IGNORECASE):
            sanitized = re.sub(
                pattern,
                "[Consult your physician for exact medication dosage]",
                generated_text,
                flags=re.IGNORECASE,
            )
            return True, sanitized
    return True, generated_text
