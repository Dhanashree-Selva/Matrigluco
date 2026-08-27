import re


def redact_pii(text: str) -> str:
    """
    Redacts phone numbers, email addresses, and identification numbers from prompts.
    """
    # Redact email addresses
    text = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "[EMAIL_REDACTED]", text)
    # Redact phone numbers (10+ digits)
    text = re.sub(
        r"\b\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE_REDACTED]", text
    )
    return text
