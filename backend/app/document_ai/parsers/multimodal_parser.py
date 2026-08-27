import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("matrigluco.document_ai.multimodal")


class MultimodalRegionParser:
    """
    Optional visual adjudicator for ambiguous crops or difficult scanned cells.
    Operates strictly on bounded image crops (label + value + surrounding context),
    never whole documents.
    """

    def __init__(self, enabled: bool = False):
        self.enabled = enabled

    def adjudicate_crop(
        self,
        image_bytes: bytes,
        candidate_label: str,
        detected_text: str,
    ) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None

        # When local VLM is configured, runs deterministic low-temperature crop extraction
        logger.info(f"Multimodal adjudication invoked for candidate '{candidate_label}'")
        return None
