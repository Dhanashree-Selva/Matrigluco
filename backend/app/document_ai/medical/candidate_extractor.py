import uuid
from typing import List, Dict, Any, Optional
from app.document_ai.contracts.document import ParsedDocument
from app.document_ai.contracts.extraction import (
    ExtractionCandidate,
    SupportedConcept,
    CandidateQuality,
    ValidationStatus,
    ReviewStatus,
)
from app.document_ai.contracts.evidence import EvidenceSnippet, SourceProvenance
from app.document_ai.contracts.element import BoundingBox
from app.document_ai.medical.terminology import ClinicalTerminologyRegistry
from app.document_ai.medical.value_parser import MedicalValueParser
from app.document_ai.medical.unit_normalizer import UnitNormalizer
from app.document_ai.medical.reference_range import ReferenceRangeParser
from app.document_ai.medical.validators import MedicalValueValidator
from app.document_ai.reconstruction.table_reconstructor import TableSemanticReconstructor
from app.document_ai.reconstruction.key_value_linker import KeyValueSpatialLinker
from app.document_ai.reconstruction.section_builder import SectionBuilder


class MedicalCandidateExtractor:
    """
    Main extraction engine transforming parsed layout geometry into verified medical candidates:
    1. Table Semantic Reconstruction
    2. Spatial Key-Value Linking
    3. Clinical Terminology Matching
    4. Exact Decimal Value & Comparator Parsing
    5. Unit Normalization
    6. Deterministic Validation
    """

    def __init__(self):
        self.terminology = ClinicalTerminologyRegistry()
        self.value_parser = MedicalValueParser()
        self.unit_normalizer = UnitNormalizer()
        self.ref_range_parser = ReferenceRangeParser()
        self.validator = MedicalValueValidator()
        self.table_reconstructor = TableSemanticReconstructor()
        self.key_value_linker = KeyValueSpatialLinker()
        self.section_builder = SectionBuilder()

    def extract_candidates(self, parsed_doc: ParsedDocument) -> List[ExtractionCandidate]:
        candidates: List[ExtractionCandidate] = []
        seen_concepts = set()

        for page in parsed_doc.pages:
            # Filter noise headers/footers
            clean_elements = self.section_builder.filter_noise_elements(page.elements)

            # 1. Extract from Structured Tables
            for table in page.tables:
                table_obs = self.table_reconstructor.reconstruct_table_observations(table)
                for obs in table_obs:
                    cand = self._process_observation(obs, page.page_number, parsed_doc.pipeline_version)
                    if cand and cand.concept not in seen_concepts:
                        seen_concepts.add(cand.concept)
                        candidates.append(cand)

            # 2. Extract from Spatial Key-Values
            kv_obs = self.key_value_linker.link_key_values(clean_elements)
            for obs in kv_obs:
                cand = self._process_observation(obs, page.page_number, parsed_doc.pipeline_version)
                if cand and cand.concept not in seen_concepts:
                    seen_concepts.add(cand.concept)
                    candidates.append(cand)

        return candidates

    def _process_observation(
        self,
        obs: Dict[str, Any],
        page_number: int,
        pipeline_version: str,
    ) -> Optional[ExtractionCandidate]:
        raw_label = obs.get("test_name", "")
        raw_val_str = obs.get("raw_value", "")
        raw_unit_str = obs.get("raw_unit")

        if not raw_label or not raw_val_str:
            return None

        # 1. Match clinical concept
        concept = self.terminology.match_concept(raw_label)
        if not concept:
            return None

        # 2. Parse numeric value & comparator
        norm_val, comparator = self.value_parser.parse_value(raw_val_str)

        # 3. Normalize unit
        norm_unit = self.unit_normalizer.normalize_unit(raw_unit_str, concept)

        # 4. Parse reference range if available
        ref_range_info = self.ref_range_parser.parse_reference_range(obs.get("reference_range"))
        ref_range_str = ref_range_info.get("raw") if ref_range_info else None

        # 5. Build Bounding Box & Evidence
        bbox = obs.get("bbox") or BoundingBox(x0=0.0, y0=0.0, x1=1.0, y1=1.0, page_number=page_number)
        snippet_text = f"{raw_label} {raw_val_str} {raw_unit_str or ''}".strip()

        evidence = EvidenceSnippet(
            page_number=page_number,
            bbox=bbox,
            raw_snippet=snippet_text,
            source_type=obs.get("source_type", "native_pdf_text"),
        )

        provenance = SourceProvenance(
            parser_name="document_intelligence",
            parser_version=pipeline_version,
            evidence=evidence,
            confidence=1.0,
        )

        candidate = ExtractionCandidate(
            candidate_id=f"cand_{uuid.uuid4().hex[:8]}",
            concept=concept,
            raw_label=raw_label,
            raw_value=str(raw_val_str),
            raw_unit=raw_unit_str,
            normalized_value=norm_val,
            normalized_unit=norm_unit,
            comparator=comparator,
            reference_range=ref_range_str,
            flag=obs.get("flag"),
            quality=CandidateQuality.HIGH_CONFIDENCE,
            validation_status=ValidationStatus.VALID,
            review_status=ReviewStatus.UNREVIEWED,
            provenance=provenance,
        )

        # 6. Validate candidate
        candidate.validation_status = self.validator.validate_candidate(candidate)

        return candidate
