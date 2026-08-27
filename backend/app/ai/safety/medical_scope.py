import re
from typing import Tuple

EMERGENCY_KEYWORDS = [
    r"heavy\s*bleeding",
    r"vaginal\s*bleeding",
    r"severe\s*abdominal\s*pain",
    r"loss\s*of\s*fetal\s*movement",
    r"baby\s*stopped\s*moving",
    r"convulsions",
    r"seizures",
    r"water\s*broke\s*early",
    r"premature\s*labor",
]


def check_emergency_symptoms(user_message: str) -> Tuple[bool, str]:
    """
    Checks for high-risk obstetric and maternal medical emergencies.
    Returns (is_emergency, emergency_guidance).
    """
    clean_msg = user_message.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, clean_msg):
            return (
                True,
                "**URGENT MEDICAL NOTICE**: The symptoms you described may require immediate medical attention. "
                "Please go to the nearest emergency room or contact your obstetrician / emergency healthcare provider immediately.",
            )
    return False, ""
