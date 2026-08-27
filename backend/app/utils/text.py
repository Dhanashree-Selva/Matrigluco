import re


def clean_whitespace(text: str) -> str:
    """Normalizes multiple consecutive whitespaces and newlines into single spaces."""
    return re.sub(r"\s+", " ", text).strip()


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncates text safely at maximum length with suffix."""
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)].rstrip() + suffix
