import logging
from abc import ABC, abstractmethod
from typing import List, Optional

logger = logging.getLogger("matrigluco.integrations.email")


class EmailClient(ABC):
    @abstractmethod
    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        pass


class SMTPEmailClient(EmailClient):
    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        logger.info(f"Dispatching email to {to_email}: '{subject}'")
        # Ready for SMTP / SendGrid configuration
        return True
