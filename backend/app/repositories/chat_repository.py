from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.models.chat_feedback import ChatFeedback


class ChatRepository:
    """
    SQLAlchemy repository for AI chatbot sessions, messages, and feedback.
    Enforces user ownership constraints directly in SQL queries.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_conversation(self, conversation_id: str) -> Optional[ChatConversation]:
        """Fetch conversation by ID."""
        stmt = select(ChatConversation).where(ChatConversation.id == conversation_id)
        return self.db.scalars(stmt).first()

    def get_owned_conversation(
        self, conversation_id: str, owner_user_id: str
    ) -> Optional[ChatConversation]:
        """Fetch conversation scoped to owning patient."""
        stmt = select(ChatConversation).where(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == owner_user_id,
        )
        return self.db.scalars(stmt).first()

    def list_owned_conversations(
        self, owner_user_id: str, limit: int = 50
    ) -> List[ChatConversation]:
        """List conversations scoped to owning patient."""
        stmt = (
            select(ChatConversation)
            .where(ChatConversation.user_id == owner_user_id)
            .order_by(ChatConversation.updated_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def list_user_conversations(self, user_id: str, limit: int = 50) -> List[ChatConversation]:
        """Alias for list_owned_conversations."""
        return self.list_owned_conversations(user_id, limit=limit)

    def create_conversation(self, conversation: ChatConversation) -> ChatConversation:
        self.db.add(conversation)
        self.db.flush()
        return conversation

    def add_message(self, message: ChatMessage) -> ChatMessage:
        self.db.add(message)
        self.db.flush()
        return message

    def get_conversation_messages(self, conversation_id: str) -> List[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(self.db.scalars(stmt).all())

    def get_message_by_id(self, message_id: str) -> Optional[ChatMessage]:
        """Fetch chat message by ID."""
        stmt = select(ChatMessage).where(ChatMessage.id == message_id)
        return self.db.scalars(stmt).first()

    def add_feedback(self, feedback: ChatFeedback) -> ChatFeedback:
        self.db.add(feedback)
        self.db.flush()
        return feedback
