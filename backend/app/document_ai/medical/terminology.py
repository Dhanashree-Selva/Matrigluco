import re
from typing import Dict, List, Tuple, Optional
from app.document_ai.contracts.extraction import SupportedConcept


class ClinicalTerminologyRegistry:
    """
    Versioned registry mapping clinical lab synonyms to SupportedConcepts.
    Prioritizes qualified concepts (Fasting vs Postprandial vs Random) to prevent concept conflation.
    """

    VERSION = "terminology_v2.0"

    # Specific patterns evaluated in priority order
    CONCEPT_PATTERNS: List[Tuple[SupportedConcept, List[str]]] = [
        (
            SupportedConcept.FASTING_GLUCOSE,
            [
                r"fasting\s*(?:blood\s*|plasma\s*|serum\s*)?glucose(?:\s*\(fbs\))?",
                r"glucose\s*fasting",
                r"fbs",
                r"f\.b\.s\.?",
                r"fasting\s*blood\s*sugar",
                r"fasting\s*sugar",
                r"fasting",
            ],
        ),
        (
            SupportedConcept.POSTPRANDIAL_GLUCOSE,
            [
                r"(?:2[- ]?hour\s*)?post\s*prandial\s*(?:blood\s*|plasma\s*|serum\s*)?glucose(?:\s*\(ppbs\))?",
                r"glucose\s*(?:2h\s*)?pp",
                r"ppbs",
                r"p\.p\.b\.s\.?",
                r"post\s*prandial\s*blood\s*sugar",
                r"post\s*prandial\s*sugar",
                r"2h\s*ppbs",
                r"post\s*prandial",
            ],
        ),
        (
            SupportedConcept.HBA1C,
            [
                r"glycated\s*hemoglobin(?:\s*\(hba1c\))?",
                r"glycohemoglobin",
                r"hba1c",
                r"hb\s*a1c",
                r"hb1ac",
                r"a1c",
            ],
        ),
        (
            SupportedConcept.BP_SYSTOLIC,
            [
                r"systolic\s*blood\s*pressure",
                r"bp\s*systolic",
                r"systolic\s*bp",
                r"systolic",
            ],
        ),
        (
            SupportedConcept.BP_DIASTOLIC,
            [
                r"diastolic\s*blood\s*pressure",
                r"bp\s*diastolic",
                r"diastolic\s*bp",
                r"diastolic",
            ],
        ),
        (
            SupportedConcept.BLOOD_PRESSURE,
            [
                r"blood\s*pressure\s*\(systolic/diastolic\)",
                r"blood\s*pressure",
                r"bp\s*reading",
                r"b\.p\.",
            ],
        ),
        (
            SupportedConcept.BMI,
            [
                r"body\s*mass\s*index(?:\s*\(bmi\))?",
                r"bmi",
            ],
        ),
        (
            SupportedConcept.INSULIN,
            [
                r"serum\s*insulin(?:\s*\(fasting\))?",
                r"fasting\s*insulin",
                r"serum\s*fasting\s*insulin",
                r"insulin",
            ],
        ),
        (
            SupportedConcept.PLATELETS,
            [
                r"platelet\s*count",
                r"platelets",
            ],
        ),
        (
            SupportedConcept.CHOLESTEROL,
            [
                r"total\s*serum\s*cholesterol",
                r"total\s*cholesterol",
                r"serum\s*cholesterol",
                r"cholesterol",
            ],
        ),
        (
            SupportedConcept.GLUCOSE,
            [
                r"estimated\s*average\s*glucose",
                r"(?:blood|plasma|serum)\s*glucose",
                r"random\s*blood\s*sugar",
                r"rbs",
                r"r\.b\.s\.?",
                r"glucose",
                r"sugar",
            ],
        ),
    ]

    def match_concept(self, text: str) -> Optional[SupportedConcept]:
        cleaned = text.lower().strip()
        for concept, patterns in self.CONCEPT_PATTERNS:
            for pat in patterns:
                # Require word-boundary match
                regex = rf"\b{pat}\b"
                if re.search(regex, cleaned):
                    return concept
        return None
