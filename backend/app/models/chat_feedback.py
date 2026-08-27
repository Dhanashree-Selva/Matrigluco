import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from app.db.base import Base


class ChatFeedback(Base):
    __tablename__ = "chat_feedbacks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(
        String(36), ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating = Column(Integer, nullable=False)  # 1 (helpful) or -1 (not helpful)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
