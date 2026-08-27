from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.schemas.chatbot import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    FeedbackCreate,
)
from app.services.chatbot_service import ChatbotService
from app.api.dependencies import get_chatbot_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])


@router.post(
    "/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create chat conversation",
)
def create_conversation(
    payload: ConversationCreate,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Initializes new maternal health consultation conversation session."""
    return service.create_conversation(
        user_id=user.id, title=payload.title or "Maternal Health Consultation"
    )


@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    summary="List user chat conversations",
)
def list_conversations(
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Lists user active and historical AI conversation sessions."""
    return service.list_user_conversations(user_id=user.id)


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get conversation detail",
)
def get_conversation_detail(
    conversation_id: str,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Retrieves single owned chat conversation session."""
    return service.get_conversation(conversation_id=conversation_id, user_id=user.id)


@router.patch(
    "/conversations/{conversation_id}",
    response_model=ConversationResponse,
    summary="Update conversation",
)
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Updates title or archive status of an owned conversation."""
    return service.update_conversation(
        conversation_id=conversation_id, user_id=user.id, payload=payload
    )


@router.delete(
    "/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete conversation"
)
@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete conversation",
)
def delete_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Deletes/archives an owned chat conversation session."""
    service.delete_conversation(conversation_id=conversation_id, user_id=user.id)


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[MessageResponse],
    summary="Get conversation messages",
)
def get_conversation_messages(
    conversation_id: str,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Retrieves message history for a specific conversation session."""
    return service.get_messages(conversation_id=conversation_id, user_id=user.id)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessageResponse,
    summary="Send message and generate response",
)
def send_chat_message(
    conversation_id: str,
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Sends maternal query and generates offline AI guidance response."""
    return service.send_message(
        conversation_id=conversation_id,
        user_id=user.id,
        content=payload.content,
        pregnancy_week=user.pregnancy_week,
        use_health_context=payload.use_health_context,
        resource_type=payload.resource_type,
        resource_id=payload.resource_id,
    )


@router.post(
    "/conversations/{conversation_id}/stream", summary="Stream message and generate token stream"
)
def stream_chat_message(
    conversation_id: str,
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Streams offline AI guidance tokens via Server-Sent Events (SSE)."""

    def event_generator():
        try:
            for token in service.stream_message(
                conversation_id=conversation_id,
                user_id=user.id,
                content=payload.content,
                pregnancy_week=user.pregnancy_week,
                use_health_context=payload.use_health_context,
                resource_type=payload.resource_type,
                resource_id=payload.resource_id,
            ):
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR: {str(e)}]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/messages/{message_id}/feedback", summary="Submit message feedback")
def submit_message_feedback(
    message_id: str,
    payload: FeedbackCreate,
    user: User = Depends(get_current_user),
    service: ChatbotService = Depends(get_chatbot_service),
):
    """Submits patient feedback for AI response quality monitoring."""
    return service.submit_feedback(message_id=message_id, user_id=user.id, feedback=payload)
