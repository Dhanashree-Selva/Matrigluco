import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.chat_repository import ChatRepository
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.models.chat_feedback import ChatFeedback
from app.models.user import User
from app.models.risk_assessment import RiskAssessment, Prediction
from app.models.health import HealthMeasurement
from app.models.medical_report import Report
from app.schemas.chatbot import (
    ConversationResponse,
    MessageResponse,
    FeedbackCreate,
    ConversationUpdate,
)
from app.ai.chatbot.orchestrator import ChatOrchestrator
from app.ai.chatbot.contracts import ConversationContextDTO, ChatMessageDTO
from app.core.exceptions import ResourceNotFoundError

logger = logging.getLogger("matrigluco.services.chatbot")


class ChatbotService:
    """
    Application service managing AI chatbot workflows:
    Ownership Authorization -> Clinical Context Assembly (Risk Assessment, Glucose Telemetry) -> Orchestrator Generation -> Persistence -> Transactions.
    """

    def __init__(self, db: Session, orchestrator: Optional[ChatOrchestrator] = None):
        self.db = db
        self.repo = ChatRepository(db)
        self.orchestrator = orchestrator or ChatOrchestrator()

    def create_conversation(
        self, user_id: str, title: str = "Maternal Health Consultation"
    ) -> ConversationResponse:
        """Creates new conversation session owned by authenticated patient."""
        conv = ChatConversation(user_id=user_id, title=title)
        try:
            self.repo.create_conversation(conv)
            self.db.commit()
            self.db.refresh(conv)
            return ConversationResponse.model_validate(conv)
        except Exception as e:
            logger.error(f"Failed to create conversation: {e}")
            self.db.rollback()
            raise

    def list_user_conversations(self, user_id: str) -> List[ConversationResponse]:
        """Lists conversations scoped to authenticated patient."""
        convs = self.repo.list_owned_conversations(user_id)
        return [ConversationResponse.model_validate(c) for c in convs]

    def get_conversation(self, conversation_id: str, user_id: str) -> ConversationResponse:
        """Retrieves single conversation owned by user."""
        conv = self.repo.get_owned_conversation(conversation_id, user_id)
        if not conv:
            raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)
        return ConversationResponse.model_validate(conv)

    def update_conversation(
        self, conversation_id: str, user_id: str, payload: ConversationUpdate
    ) -> ConversationResponse:
        """Updates title or status of owned conversation."""
        conv = self.repo.get_owned_conversation(conversation_id, user_id)
        if not conv:
            raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)

        if payload.title is not None:
            conv.title = payload.title
        if payload.status is not None:
            conv.status = payload.status

        self.db.add(conv)
        self.db.commit()
        self.db.refresh(conv)
        return ConversationResponse.model_validate(conv)

    def delete_conversation(self, conversation_id: str, user_id: str) -> None:
        """Deletes or archives an owned conversation."""
        conv = self.repo.get_owned_conversation(conversation_id, user_id)
        if not conv:
            raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)

        self.db.delete(conv)
        self.db.commit()

    def _build_context_dto(
        self,
        conversation_id: str,
        user_id: str,
        pregnancy_week: Optional[int] = None,
        use_health_context: Optional[bool] = True,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ) -> ConversationContextDTO:
        """
        Assembles verified patient clinical context from SQL:
        - Maternal profile (pregnancy week, EDD, blood group, age)
        - Latest GDM ML Risk Assessment
        - Recent Health Telemetry & Blood Glucose logs
        - Focused resource if explicitly referenced
        """
        if not use_health_context:
            return ConversationContextDTO(
                conversation_id=conversation_id,
                user_id=user_id,
                use_health_context=False,
            )

        # 1. Fetch user profile
        user = self.db.query(User).filter(User.id == user_id).first()
        due_date = user.expected_due_date if user else None
        blood_group = user.blood_group if user else None
        age = user.age if user else None
        prev_preg = user.previous_pregnancies if user else None
        week = pregnancy_week if pregnancy_week is not None else (user.pregnancy_week if user else None)

        # 2. Fetch latest risk assessment or ML prediction
        latest_assessment = None
        risk_level = None
        try:
            assessment = (
                self.db.query(RiskAssessment)
                .filter(RiskAssessment.user_id == user_id, RiskAssessment.archived_at.is_(None))
                .order_by(RiskAssessment.created_at.desc())
                .first()
            )
            if assessment:
                risk_level = assessment.risk_band
                latest_assessment = {
                    "risk_band": assessment.risk_band,
                    "probability": assessment.probability,
                    "prediction_result": assessment.prediction_result,
                    "input_snapshot_json": assessment.input_snapshot_json,
                    "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
                }
            else:
                pred = (
                    self.db.query(Prediction)
                    .filter(Prediction.user_id == user_id)
                    .order_by(Prediction.created_at.desc())
                    .first()
                )
                if pred:
                    risk_level = pred.risk_band or ("High Risk" if pred.prediction_result == 1 else "Low Risk")
                    latest_assessment = {
                        "risk_band": risk_level,
                        "probability": pred.probability,
                        "prediction_result": "Positive (High Risk)" if pred.prediction_result == 1 else "Negative (Low Risk)",
                        "input_snapshot_json": {
                            "glucose": pred.glucose,
                            "bmi": pred.bmi,
                            "blood_pressure": pred.blood_pressure,
                            "insulin": pred.insulin,
                            "pregnancies": pred.pregnancies,
                            "age": pred.age,
                            "skin_thickness": pred.skin_thickness,
                            "diabetes_pedigree": pred.diabetes_pedigree_function,
                        },
                        "created_at": pred.created_at.isoformat() if pred.created_at else None,
                    }
        except Exception as e:
            logger.warning(f"Error fetching risk assessment for context: {e}")

        # 3. Fetch recent glucose & vital measurements (last 10)
        recent_measurements = []
        try:
            measurements = (
                self.db.query(HealthMeasurement)
                .filter(HealthMeasurement.user_id == user_id, HealthMeasurement.archived_at.is_(None))
                .order_by(HealthMeasurement.measured_at.desc())
                .limit(10)
                .all()
            )
            for m in measurements:
                recent_measurements.append({
                    "metric_type": m.metric_type,
                    "value_primary": m.value_primary,
                    "value_secondary": m.value_secondary,
                    "unit": m.unit,
                    "measured_at": m.measured_at.isoformat() if m.measured_at else None,
                    "measured_at_formatted": m.measured_at.strftime("%b %d, %H:%M") if m.measured_at else None,
                    "notes": m.notes,
                })
        except Exception as e:
            logger.warning(f"Error fetching health measurements for context: {e}")

        # 4. Focused Resource
        focused_resource = None
        try:
            if resource_type == "report" and resource_id:
                rep = self.db.query(Report).filter(Report.user_id == user_id, Report.id == resource_id).first()
                if rep:
                    focused_resource = {
                        "type": "Clinical Lab Report",
                        "details": f"File: {rep.file_name}\nExtracted Values: {rep.extracted_values}\nEvaluated Risk: {rep.risk_level}",
                    }
            elif resource_type == "tracking":
                focused_resource = {
                    "type": "Glucose Telemetry Trend",
                    "details": "Patient is referencing recent blood glucose telemetry trends.",
                }
        except Exception as e:
            logger.warning(f"Error fetching focused resource context: {e}")

        return ConversationContextDTO(
            conversation_id=conversation_id,
            user_id=user_id,
            pregnancy_week=week,
            risk_level=risk_level,
            due_date=due_date,
            blood_group=blood_group,
            age=age,
            previous_pregnancies=prev_preg,
            latest_assessment=latest_assessment,
            recent_measurements=recent_measurements,
            focused_resource=focused_resource,
            use_health_context=True,
        )

    def send_message(
        self,
        conversation_id: str,
        user_id: str,
        content: str,
        pregnancy_week: Optional[int] = None,
        use_health_context: Optional[bool] = True,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ) -> MessageResponse:
        """
        Coordinates conversation message cycle with verified ownership:
        1. Authorize conversation ownership in SQL.
        2. Save user message.
        3. Build rich clinical context (assessments, glucose telemetry).
        4. Execute local AI orchestrator.
        5. Save assistant reply in database.
        6. Commit transaction.
        """
        conv = self.repo.get_owned_conversation(conversation_id, user_id)
        if not conv:
            raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)

        try:
            # 1. Save user message
            user_msg = ChatMessage(
                conversation_id=conversation_id,
                role="user",
                content=content,
            )
            self.repo.add_message(user_msg)

            # 2. Retrieve history for context
            db_messages = self.repo.get_conversation_messages(conversation_id)
            dto_history = [
                ChatMessageDTO(role=m.role, content=m.content, message_id=m.id)
                for m in db_messages[:-1]
            ]

            # 3. Build verified clinical context
            context_dto = self._build_context_dto(
                conversation_id=conversation_id,
                user_id=user_id,
                pregnancy_week=pregnancy_week,
                use_health_context=use_health_context,
                resource_type=resource_type,
                resource_id=resource_id,
            )

            # 4. Process via offline AI orchestrator
            response_dto = self.orchestrator.process_message(
                context=context_dto,
                history=dto_history,
                user_message=content,
            )

            # 5. Save assistant reply
            assistant_msg = ChatMessage(
                conversation_id=conversation_id,
                role="assistant",
                content=response_dto.message,
                tokens_used=response_dto.tokens_generated,
                latency_ms=response_dto.latency_ms,
                sources=response_dto.sources_cited,
            )
            self.repo.add_message(assistant_msg)

            # 6. Commit transaction atomically
            self.db.commit()
            self.db.refresh(assistant_msg)

            return MessageResponse.model_validate(assistant_msg)
        except Exception as e:
            logger.error(f"Failed to process chat message in conversation '{conversation_id}': {e}")
            self.db.rollback()
            raise

    def stream_message(
        self,
        conversation_id: str,
        user_id: str,
        content: str,
        pregnancy_week: Optional[int] = None,
        use_health_context: Optional[bool] = True,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ):
        """Streams response tokens with rich patient clinical context."""
        conv = self.repo.get_owned_conversation(conversation_id, user_id)
        if not conv:
            raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)

        # 1. Save user message and commit
        user_msg = ChatMessage(
            conversation_id=conversation_id,
            role="user",
            content=content,
        )
        self.repo.add_message(user_msg)
        self.db.commit()

        # 2. Retrieve history for context
        db_messages = self.repo.get_conversation_messages(conversation_id)
        dto_history = [
            ChatMessageDTO(role=m.role, content=m.content, message_id=m.id)
            for m in db_messages[:-1]
        ]

        # 3. Build verified clinical context
        context_dto = self._build_context_dto(
            conversation_id=conversation_id,
            user_id=user_id,
            pregnancy_week=pregnancy_week,
            use_health_context=use_health_context,
            resource_type=resource_type,
            resource_id=resource_id,
        )

        # 4. Stream tokens
        full_response = []
        for token in self.orchestrator.stream_message(context_dto, dto_history, content):
            full_response.append(token)
            yield token

        # 5. Save completed assistant reply
        completed_text = "".join(full_response)
        if completed_text:
            assistant_msg = ChatMessage(
                conversation_id=conversation_id,
                role="assistant",
                content=completed_text,
            )
            self.repo.add_message(assistant_msg)
            self.db.commit()

    def get_messages(
        self, conversation_id: str, user_id: Optional[str] = None
    ) -> List[MessageResponse]:
        """Retrieves messages for authorized conversation."""
        if user_id:
            conv = self.repo.get_owned_conversation(conversation_id, user_id)
            if not conv:
                raise ResourceNotFoundError(resource="ChatConversation", identifier=conversation_id)

        messages = self.repo.get_conversation_messages(conversation_id)
        return [MessageResponse.model_validate(m) for m in messages]

    def submit_feedback(
        self, message_id: str, user_id: str, feedback: FeedbackCreate
    ) -> Dict[str, str]:
        """Records patient rating and comment for response quality assurance."""
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise ResourceNotFoundError(resource="ChatMessage", identifier=message_id)

        fb = ChatFeedback(
            message_id=message_id,
            user_id=user_id,
            rating=feedback.rating,
            comment=feedback.comment,
        )
        self.repo.add_feedback(fb)
        self.db.commit()
        return {"status": "success", "message_id": message_id}
