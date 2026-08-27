import re
import logging
import sys
from typing import Optional

SENSITIVE_PATTERNS = [
    (
        re.compile(r'(password["\']?\s*[:=]\s*["\'])([^"\']+)(["\'])', re.IGNORECASE),
        r"\1[REDACTED]\3",
    ),
    (
        re.compile(r'(access_token["\']?\s*[:=]\s*["\'])([^"\']+)(["\'])', re.IGNORECASE),
        r"\1[REDACTED]\3",
    ),
    (
        re.compile(r'(refresh_token["\']?\s*[:=]\s*["\'])([^"\']+)(["\'])', re.IGNORECASE),
        r"\1[REDACTED]\3",
    ),
    (
        re.compile(r'(api_key["\']?\s*[:=]\s*["\'])([^"\']+)(["\'])', re.IGNORECASE),
        r"\1[REDACTED]\3",
    ),
    (re.compile(r"(Bearer\s+)[A-Za-z0-9\-_.]+", re.IGNORECASE), r"\1[REDACTED]"),
    (
        re.compile(r"(\b[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\b)"),
        r"[REDACTED_JWT]",
    ),
]


class SensitiveDataFilter(logging.Filter):
    """Filter that sanitizes passwords, JWTs, refresh tokens, and sensitive API keys in log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            sanitized = record.msg
            for pattern, replacement in SENSITIVE_PATTERNS:
                sanitized = pattern.sub(replacement, sanitized)
            record.msg = sanitized
        return True


def setup_logging(log_level: Optional[str] = "INFO", log_format: Optional[str] = "text") -> None:
    """Configures structured application logging."""
    numeric_level = getattr(logging, (log_level or "INFO").upper(), logging.INFO)

    log_formatter: logging.Formatter
    if log_format == "json":
        log_formatter = logging.Formatter(
            '{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
        )
    else:
        log_formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    # Configure stdout stream handler
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(numeric_level)
    stream_handler.setFormatter(log_formatter)
    stream_handler.addFilter(SensitiveDataFilter())

    # Root logger setup
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    root_logger.handlers = [stream_handler]

    # Set external third-party loggers to reasonable levels
    logging.getLogger("uvicorn.access").setLevel(numeric_level)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.ERROR)
