import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.ai_model_repository import AIModelRepository
from app.models.ai_model import AIModel
from app.schemas.ai_model import AIModelRegisterRequest, AIModelResponse
from app.core.exceptions import ResourceNotFoundError

logger = logging.getLogger("matrigluco.services.ai_model")


class AIModelService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AIModelRepository(db)

    def list_models(self) -> List[AIModelResponse]:
        models = self.repo.get_all()
        return [AIModelResponse.model_validate(m) for m in models]

    def register_model(self, request: AIModelRegisterRequest) -> AIModelResponse:
        model = AIModel(**request.model_dump())
        saved = self.repo.create(model)
        return AIModelResponse.model_validate(saved)
