import math
from dataclasses import dataclass
from typing import List, Generic, TypeVar, Any

T = TypeVar("T")


@dataclass
class PaginationParams:
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return max(0, (self.page - 1) * self.page_size)


@dataclass
class PaginatedResult(Generic[T]):
    items: List[T]
    page: int
    page_size: int
    total: int

    @property
    def pages(self) -> int:
        return math.ceil(self.total / self.page_size) if self.page_size > 0 else 0
