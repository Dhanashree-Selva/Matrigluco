from typing import Optional
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import (
    AuthenticationRequiredError,
    AccountDisabledError,
    EmailNotVerifiedError,
    AuthorizationError,
    ResourceNotFoundError,
)
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.prediction_service import PredictionService
from app.services.report_service import ReportService
from app.services.consultation_service import ConsultationService
from app.services.chatbot_service import ChatbotService
from app.services.knowledge_service import KnowledgeService
from app.services.ai_model_service import AIModelService
from app.services.dashboard_service import DashboardService
from app.services.history_service import HistoryService
from app.integrations.storage.service import StorageIntegrationService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ─── Authentication & Identity Dependencies ───────────────────────────────────


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency extracting and validating the JWT Bearer token,
    loading the active User principal from MySQL, and enforcing account status checks.
    """
    if not token:
        raise AuthenticationRequiredError(message="Authentication credentials were not provided.")

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationRequiredError(message="Token subject claim is missing.")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise ResourceNotFoundError(resource="User", identifier=user_id)

    if user.status == "disabled":
        raise AccountDisabledError()

    return user


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optional authentication dependency returning User if valid token present, otherwise None."""
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except Exception:
        return None


def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    """Explicit dependency ensuring valid authenticated principal."""
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforces administrator role authorization."""
    if current_user.role != "admin":
        raise AuthorizationError(message="Administrative privileges are required for this action.")
    return current_user


def require_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """Enforces that the user has verified their email address."""
    if not current_user.email_verified_at:
        raise EmailNotVerifiedError()
    return current_user


# ─── Service Providers ────────────────────────────────────────────────────────


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_prediction_service(db: Session = Depends(get_db)) -> PredictionService:
    return PredictionService(db)


def get_report_service(db: Session = Depends(get_db)) -> ReportService:
    return ReportService(db)


def get_consultation_service(db: Session = Depends(get_db)) -> ConsultationService:
    return ConsultationService(db)


def get_chatbot_service(db: Session = Depends(get_db)) -> ChatbotService:
    return ChatbotService(db)


def get_knowledge_service(db: Session = Depends(get_db)) -> KnowledgeService:
    return KnowledgeService(db)


def get_ai_model_service(db: Session = Depends(get_db)) -> AIModelService:
    return AIModelService(db)


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


def get_storage_service() -> StorageIntegrationService:
    return StorageIntegrationService()


def get_history_service(db: Session = Depends(get_db)) -> HistoryService:
    return HistoryService(db)

