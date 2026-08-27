from app.schemas.common import (
    PaginationMeta,
    PaginatedResponse,
    MessageResponse as SystemMessageResponse,
)
from app.schemas.auth import (
    UserSignUp,
    UserSignIn,
    AuthResponse,
    ResetPasswordRequest,
    RefreshTokenRequest,
)
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    PredictionSaveRequest,
    PredictionRead,
)
from app.schemas.report import ReportResponse, SaveReportRequest
from app.schemas.consultation import DoctorAppointmentCreate, DoctorAppointmentResponse
from app.schemas.chatbot import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    FeedbackCreate,
)
from app.schemas.ai_model import AIModelResponse, AIModelRegisterRequest
from app.schemas.knowledge import KnowledgeDocResponse, KnowledgeChunkResponse

__all__ = [
    "PaginationMeta",
    "PaginatedResponse",
    "SystemMessageResponse",
    "UserSignUp",
    "UserSignIn",
    "AuthResponse",
    "ResetPasswordRequest",
    "RefreshTokenRequest",
    "UserResponse",
    "UserUpdate",
    "PredictionRequest",
    "PredictionResponse",
    "PredictionSaveRequest",
    "PredictionRead",
    "ReportResponse",
    "SaveReportRequest",
    "DoctorAppointmentCreate",
    "DoctorAppointmentResponse",
    "ConversationCreate",
    "ConversationResponse",
    "MessageCreate",
    "MessageResponse",
    "FeedbackCreate",
    "AIModelResponse",
    "AIModelRegisterRequest",
    "KnowledgeDocResponse",
    "KnowledgeChunkResponse",
]
