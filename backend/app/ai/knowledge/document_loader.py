from pathlib import Path
from typing import Optional


class DocumentLoader:
    """Loads plain text or PDF clinical knowledge sources."""

    def load_text_file(self, file_path: Path) -> str:
        if not file_path.exists():
            raise FileNotFoundError(f"Knowledge document not found at {file_path}")
        return file_path.read_text(encoding="utf-8")
