from typing import List, Dict
from app.document_ai.contracts.extraction import (
    ExtractionCandidate,
    CandidateQuality,
    ReviewStatus,
    SupportedConcept,
)


class CandidateAdjudicator:
    """
    Cross-parser adjudicator:
    - Identifies candidate agreement vs conflict across multiple parsing passes.
    - NEVER averages contradictory values.
    - Flags discrepancies as CONFLICT / NEEDS_REVIEW.
    """

    def adjudicate_candidates(
        self, candidates: List[ExtractionCandidate]
    ) -> List[ExtractionCandidate]:
        if not candidates:
            return []

        # Group by concept
        by_concept: Dict[SupportedConcept, List[ExtractionCandidate]] = {}
        for c in candidates:
            by_concept.setdefault(c.concept, []).append(c)

        adjudicated: List[ExtractionCandidate] = []

        for concept, group in by_concept.items():
            if len(group) == 1:
                adjudicated.append(group[0])
                continue

            # Compare normalized values
            first_val = group[0].normalized_value
            all_agree = all(g.normalized_value == first_val for g in group)

            if all_agree:
                # Agreement across passes -> Strengthen confidence
                winner = group[0]
                winner.quality = CandidateQuality.HIGH_CONFIDENCE
                adjudicated.append(winner)
            else:
                # Disagreement detected -> Mark all as CONFLICT
                for g in group:
                    g.quality = CandidateQuality.CONFLICT
                    g.review_status = ReviewStatus.NEEDS_REVIEW
                    g.adjudication_notes = (
                        f"Parser conflict: Found conflicting values {[x.normalized_value for x in group]} for {concept.value}"
                    )
                    adjudicated.append(g)

        return adjudicated
