import pytest
from app.document_ai.medical.adjudicator import CandidateAdjudicator
from app.document_ai.contracts.extraction import (
    ExtractionCandidate,
    SupportedConcept,
    CandidateQuality,
    ReviewStatus,
)


def test_adjudicate_conflicting_candidates():
    adjudicator = CandidateAdjudicator()

    cand1 = ExtractionCandidate(
        candidate_id="c1",
        concept=SupportedConcept.FASTING_GLUCOSE,
        raw_label="Fasting Glucose",
        raw_value="102",
        raw_unit="mg/dL",
        normalized_value=102.0,
        normalized_unit="mg/dL",
    )
    cand2 = ExtractionCandidate(
        candidate_id="c2",
        concept=SupportedConcept.FASTING_GLUCOSE,
        raw_label="Fasting Glucose",
        raw_value="120",
        raw_unit="mg/dL",
        normalized_value=120.0,
        normalized_unit="mg/dL",
    )

    results = adjudicator.adjudicate_candidates([cand1, cand2])

    assert len(results) == 2
    assert all(r.quality == CandidateQuality.CONFLICT for r in results)
    assert all(r.review_status == ReviewStatus.NEEDS_REVIEW for r in results)


def test_adjudicate_agreeing_candidates():
    adjudicator = CandidateAdjudicator()

    cand1 = ExtractionCandidate(
        candidate_id="c1",
        concept=SupportedConcept.HBA1C,
        raw_label="HbA1c",
        raw_value="5.6",
        raw_unit="%",
        normalized_value=5.6,
        normalized_unit="%",
    )
    cand2 = ExtractionCandidate(
        candidate_id="c2",
        concept=SupportedConcept.HBA1C,
        raw_label="Glycated Hemoglobin",
        raw_value="5.6",
        raw_unit="%",
        normalized_value=5.6,
        normalized_unit="%",
    )

    results = adjudicator.adjudicate_candidates([cand1, cand2])

    assert len(results) == 1
    assert results[0].quality == CandidateQuality.HIGH_CONFIDENCE
    assert results[0].normalized_value == 5.6
