import logging
import requests
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import get_settings

logger = logging.getLogger("matrigluco.integrations.ocr")
settings = get_settings()


class OCRClient(ABC):
    @abstractmethod
    def extract_text_from_image(
        self,
        image_bytes: bytes,
        filename: str = "report.png",
        content_type: str = "image/png",
    ) -> str:
        pass


class OCRSpaceClient(OCRClient):
    """
    Client for OCR.Space API utilizing centralized settings.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        endpoint_url: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
    ):
        self.api_key = api_key or settings.OCR_API_KEY
        self.endpoint_url = endpoint_url or settings.OCR_SPACE_URL
        self.timeout_seconds = timeout_seconds or settings.OCR_TIMEOUT_SECONDS or 5

    def extract_text_from_image(
        self,
        image_bytes: bytes,
        filename: str = "report.png",
        content_type: str = "image/png",
    ) -> str:
        if len(image_bytes) == 0:
            return ""

        if not self.api_key:
            logger.warning("OCR API key is not configured. Skipping external OCR extraction.")
            return ""

        try:
            files = {"file": (filename, image_bytes, content_type)}
            payload = {
                "apikey": self.api_key,
                "language": "eng",
                "isOverlayRequired": "false",
                "OCREngine": 2,
            }
            headers = {"apikey": self.api_key}

            response = requests.post(
                self.endpoint_url,
                files=files,
                data=payload,
                headers=headers,
                timeout=self.timeout_seconds,
            )

            result = response.json()
            if result.get("ParsedResults"):
                text = ""
                for res in result["ParsedResults"]:
                    text += res.get("ParsedText", "") + " "
                return text.strip()
            return ""
        except Exception as e:
            logger.error(f"OCR request failed: {e}")
            return ""
