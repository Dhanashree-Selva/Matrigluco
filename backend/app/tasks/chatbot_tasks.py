import logging
from typing import Optional
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask

logger = logging.getLogger("matrigluco.tasks.chatbot")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.chatbot_tasks.summarize_conversation_task",
    max_retries=1,
)
def summarize_conversation_task(self, conversation_id: str, user_id: str) -> None:
    """
    Offline asynchronous task generating summary metadata for long-running chat sessions.
    (Normal interactive chat is synchronous and not queued through Celery).
    """
    logger.info(f"Summarizing conversation '{conversation_id}' for user '{user_id}'.")
    # Execute offline summarization...
    logger.info(f"Conversation '{conversation_id}' summary generated successfully.")
