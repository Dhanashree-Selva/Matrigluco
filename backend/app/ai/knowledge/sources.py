from dataclasses import dataclass
from typing import List, Dict


@dataclass
class ClinicalGuidelineSource:
    name: str
    organization: str
    year: int
    url: str
    description: str


APPROVED_CLINICAL_SOURCES: List[ClinicalGuidelineSource] = [
    ClinicalGuidelineSource(
        name="Gestational Diabetes Mellitus Diagnostic and Management Guidelines",
        organization="American Diabetes Association (ADA)",
        year=2024,
        url="https://diabetes.org",
        description="Standard blood glucose targets and screening protocols for pregnancy.",
    ),
    ClinicalGuidelineSource(
        name="Antenatal Care for Uncomplicated Pregnancies",
        organization="World Health Organization (WHO)",
        year=2023,
        url="https://who.int",
        description="Evidence-based maternal nutrition, supplement, and fetal monitoring standards.",
    ),
]
