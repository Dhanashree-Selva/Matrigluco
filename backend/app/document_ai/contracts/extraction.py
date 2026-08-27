from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, Any, List
from decimal import Decimal
from app.document_ai.contracts.evidence import EvidenceSnippet, SourceProvenance


class SupportedConcept(str, Enum):
    FASTING_GLUCOSE = "fasting_glucose"
    POSTPRANDIAL_GLUCOSE = "postprandial_glucose"
    GLUCOSE = "glucose"
    HBA1C = "hba1c"
    BP_SYSTOLIC = "bp_systolic"
    BP_DIASTOLIC = "bp_diastolic"
    BLOOD_PRESSURE = "blood_pressure"
    BMI = "bmi"
    INSULIN = "insulin"
    PLATELETS = "platelets"
    CHOLESTEROL = "cholesterol"
    HEMOGLOBIN = "hemoglobin"
    UNKNOWN = "unknown"


class ValueComparator(str, Enum):
    EQ = "EQ"
    LT = "LT"
    LTE = "LTE"
    GT = "GT"
    GTE = "GTE"


class CandidateQuality(str, Enum):
    HIGH_CONFIDENCE = "HIGH_CONFIDENCE"
    MEDIUM_CONFIDENCE = "MEDIUM_CONFIDENCE"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    CONFLICT = "CONFLICT"


class ValidationStatus(str, Enum):
    VALID = "VALID"
    PLAUSIBILITY_WARNING = "PLAUSIBILITY_WARNING"
    INVALID_UNIT = "INVALID_UNIT"
    SYNTAX_ERROR = "SYNTAX_ERROR"


class ReviewStatus(str, Enum):
    UNREVIEWED = "unreviewed"
    NEEDS_REVIEW = "needs_review"
    CONFIRMED = "confirmed"
    CORRECTED = "corrected"
    REJECTED = "rejected"


@dataclass
class ExtractionCandidate:
    candidate_id: str
    concept: SupportedConcept
    raw_label: str
    raw_value: str
    raw_unit: Optional[str]
    normalized_value: Any  # float, int, str for dual BP "120/80"
    normalized_unit: Optional[str]
    comparator: ValueComparator = ValueComparator.EQ
    reference_range: Optional[str] = None
    flag: Optional[str] = None  # High, Low, Normal, Abnormal
    is_historical: bool = False
    quality: CandidateQuality = CandidateQuality.HIGH_CONFIDENCE
    validation_status: ValidationStatus = ValidationStatus.VALID
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED
    provenance: Optional[SourceProvenance] = None
    adjudication_notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "concept": self.concept.value,
            "raw_label": self.raw_label,
            "raw_value": self.raw_value,
            "raw_unit": self.raw_unit,
            "normalized_value": self.normalized_value,
            "normalized_unit": self.normalized_unit,
            "comparator": self.comparator.value,
            "reference_range": self.reference_range,
            "flag": self.flag,
            "is_historical": self.is_historical,
            "quality": self.quality.value,
            "validation_status": self.validation_status.value,
            "review_status": self.review_status.value,
            "provenance": self.provenance.to_dict() if self.provenance else None,
            "adjudication_notes": self.adjudication_notes,
        }
