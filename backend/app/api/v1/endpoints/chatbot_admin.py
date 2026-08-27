from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.ai_model import AIModelResponse, AIModelRegisterRequest
from app.schemas.knowledge import KnowledgeDocResponse
from app.services.ai_model_service import AIModelService
from app.services.knowledge_service import KnowledgeService
from app.api.dependencies import get_ai_model_service, get_knowledge_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin/chatbot", tags=["AI Chatbot Admin"])


@router.get("/models", response_model=List[AIModelResponse])
def list_registered_models(
    service: AIModelService = Depends(get_ai_model_service),
    user: User = Depends(get_current_user),
):
    """Lists registered GGUF AI models."""
    return service.list_models()


@router.post("/models", response_model=AIModelResponse, status_code=status.HTTP_201_CREATED)
def register_model(
    payload: AIModelRegisterRequest,
    service: AIModelService = Depends(get_ai_model_service),
    user: User = Depends(get_current_user),
):
    """Registers new offline GGUF model."""
    return service.register_model(payload)


@router.get("/knowledge", response_model=List[KnowledgeDocResponse])
def list_knowledge_documents(
    service: KnowledgeService = Depends(get_knowledge_service),
    user: User = Depends(get_current_user),
):
    """Lists indexed maternal clinical knowledge documents."""
    return service.list_documents()
