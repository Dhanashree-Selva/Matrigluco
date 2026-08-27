from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, field_serializer


class HistoryEventResponse(BaseModel):
    id: str
    type: str  # "assessment", "measurement", "report", "consultation"
    occurred_at: datetime
    resource_id: str
    title: str
    summary: Optional[str] = None
    status: Optional[str] = None
    episode_id: Optional[str] = None
    episode_type: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("occurred_at", check_fields=False)
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class HistoryListResponse(BaseModel):
    items: List[HistoryEventResponse] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
    available_months: List[str] = Field(default_factory=list)
    event_counts: Dict[str, int] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)
