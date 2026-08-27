from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class ChatMessageDTO:
    role: str  # user, assistant, system
    content: str
    message_id: Optional[str] = None
    created_at: Optional[str] = None


@dataclass
class ConversationContextDTO:
    conversation_id: str
    user_id: str
    pregnancy_week: Optional[int] = None
    risk_level: Optional[str] = None
    due_date: Optional[str] = None
    blood_group: Optional[str] = None
    age: Optional[int] = None
    previous_pregnancies: Optional[int] = None
    latest_assessment: Optional[Dict[str, Any]] = None
    recent_measurements: Optional[List[Dict[str, Any]]] = None
    focused_resource: Optional[Dict[str, Any]] = None
    use_health_context: bool = True


@dataclass
class ChatResponseDTO:
    conversation_id: str
    message: str
    model_version: str
    tokens_generated: int
    latency_ms: float
    sources_cited: List[str] = field(default_factory=list)
    safety_disclaimer_included: bool = True
