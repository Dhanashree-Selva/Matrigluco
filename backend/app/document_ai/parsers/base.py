from abc import ABC, abstractmethod
from pathlib import Path
from typing import Union
from app.document_ai.contracts.document import ParsedDocument


class BaseDocumentParser(ABC):
    """Abstract interface for document intelligence parsers."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        pass

    @abstractmethod
    def parse_file(self, file_path: Union[str, Path]) -> ParsedDocument:
        pass
