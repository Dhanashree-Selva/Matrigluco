from typing import Dict, Any, List
from app.document_ai.contracts.extraction import SupportedConcept


# Canonical metadata definitions for supported clinical concepts
CONCEPT_DEFINITIONS: Dict[SupportedConcept, Dict[str, Any]] = {
    SupportedConcept.FASTING_GLUCOSE: {
        "display_name": "Fasting Plasma Glucose (FBS)",
        "canonical_unit": "mg/dL",
        "allowed_units": ["mg/dL", "mg/dl", "mmol/L", "mmol/l"],
        "plausible_min": 40.0,
        "plausible_max": 450.0,
    },
    SupportedConcept.POSTPRANDIAL_GLUCOSE: {
        "display_name": "2-Hour Postprandial Glucose (PPBS)",
        "canonical_unit": "mg/dL",
        "allowed_units": ["mg/dL", "mg/dl", "mmol/L", "mmol/l"],
        "plausible_min": 50.0,
        "plausible_max": 500.0,
    },
    SupportedConcept.GLUCOSE: {
        "display_name": "Plasma Glucose (Random)",
        "canonical_unit": "mg/dL",
        "allowed_units": ["mg/dL", "mg/dl", "mmol/L", "mmol/l"],
        "plausible_min": 40.0,
        "plausible_max": 500.0,
    },
    SupportedConcept.HBA1C: {
        "display_name": "Glycated Hemoglobin (HbA1c)",
        "canonical_unit": "%",
        "allowed_units": ["%", "percent", "mmol/mol"],
        "plausible_min": 3.5,
        "plausible_max": 18.0,
    },
    SupportedConcept.BP_SYSTOLIC: {
        "display_name": "Systolic Blood Pressure",
        "canonical_unit": "mmHg",
        "allowed_units": ["mmHg", "mmhg"],
        "plausible_min": 70.0,
        "plausible_max": 250.0,
    },
    SupportedConcept.BP_DIASTOLIC: {
        "display_name": "Diastolic Blood Pressure",
        "canonical_unit": "mmHg",
        "allowed_units": ["mmHg", "mmhg"],
        "plausible_min": 40.0,
        "plausible_max": 160.0,
    },
    SupportedConcept.BLOOD_PRESSURE: {
        "display_name": "Blood Pressure (Systolic/Diastolic)",
        "canonical_unit": "mmHg",
        "allowed_units": ["mmHg", "mmhg"],
        "plausible_min": 40.0,
        "plausible_max": 250.0,
    },
    SupportedConcept.BMI: {
        "display_name": "Body Mass Index (BMI)",
        "canonical_unit": "kg/m²",
        "allowed_units": ["kg/m²", "kg/m2", "kg/sq m"],
        "plausible_min": 12.0,
        "plausible_max": 65.0,
    },
    SupportedConcept.INSULIN: {
        "display_name": "Fasting Serum Insulin",
        "canonical_unit": "µIU/mL",
        "allowed_units": ["µIU/mL", "uIU/mL", "mIU/L", "pmol/L"],
        "plausible_min": 1.0,
        "plausible_max": 250.0,
    },
    SupportedConcept.PLATELETS: {
        "display_name": "Platelet Count",
        "canonical_unit": "10³/µL",
        "allowed_units": ["10³/µL", "10^3/uL", "thou/uL", "lakhs/cumm", "cells/cumm", "/cumm"],
        "plausible_min": 20.0,
        "plausible_max": 1000.0,
    },
    SupportedConcept.CHOLESTEROL: {
        "display_name": "Total Serum Cholesterol",
        "canonical_unit": "mg/dL",
        "allowed_units": ["mg/dL", "mg/dl", "mmol/L"],
        "plausible_min": 50.0,
        "plausible_max": 500.0,
    },
}
