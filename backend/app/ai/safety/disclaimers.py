MATERNAL_HEALTH_DISCLAIMER = (
    "\n\n*Disclaimer: MatriGluco AI Assistant provides maternal health education and guideline-based information only. "
    "It is not a substitute for clinical diagnosis or direct medical advice from your obstetrician or doctor.*"
)


def append_medical_disclaimer(response_text: str) -> str:
    """Appends standardized clinical disclaimer to AI assistant responses."""
    if "Disclaimer:" in response_text:
        return response_text
    return f"{response_text.strip()}{MATERNAL_HEALTH_DISCLAIMER}"
