from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = Field("Maternal Health Consultation", max_length=150)

    model_config = ConfigDict(extra="forbid")


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    status: Optional[str] = Field(None, max_length=30)  # active, archived

    model_config = ConfigDict(extra="forbid")


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Patient message text")
    use_health_context: Optional[bool] = Field(
        True, description="Whether to include patient clinical context"
    )
    resource_type: Optional[str] = Field(
        None, description="Optional focused resource type (assessment, report, tracking)"
    )
    resource_id: Optional[str] = Field(None, description="Optional focused resource ID")

    model_config = ConfigDict(extra="ignore")


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    tokens_used: Optional[int] = 0
    latency_ms: Optional[float] = 0.0
    sources: Optional[List[str]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackCreate(BaseModel):
    rating: int = Field(..., description="1 for helpful, -1 for unhelpful")
    comment: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(extra="forbid")
