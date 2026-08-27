from typing import Tuple
from app.document_ai.contracts.element import BoundingBox


class BoundingBoxMapper:
    """
    Normalizes coordinates from arbitrary PDF/image points into standard [0.0 - 1.0] scale.
    """

    @staticmethod
    def normalize_box(
        raw_box: Tuple[float, float, float, float],
        page_width: float,
        page_height: float,
        page_number: int = 1,
    ) -> BoundingBox:
        w = max(1.0, page_width)
        h = max(1.0, page_height)

        x0 = max(0.0, min(1.0, raw_box[0] / w))
        y0 = max(0.0, min(1.0, raw_box[1] / h))
        x1 = max(0.0, min(1.0, raw_box[2] / w))
        y1 = max(0.0, min(1.0, raw_box[3] / h))

        return BoundingBox(x0=x0, y0=y0, x1=x1, y1=y1, page_number=page_number)
