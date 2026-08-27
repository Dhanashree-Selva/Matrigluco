from typing import List, Dict
from app.ai.chatbot.contracts import ChatMessageDTO


class ConversationMemory:
    """
    Maintains bounded conversation history window for context length management.
    """

    def __init__(self, max_history_messages: int = 10):
        self.max_history = max_history_messages

    def trim_history(self, messages: List[ChatMessageDTO]) -> List[Dict[str, str]]:
        """Takes full conversation history and returns recent bounded message window."""
        recent = messages[-self.max_history :] if len(messages) > self.max_history else messages
        return [{"role": m.role, "content": m.content} for m in recent]
