#!/usr/bin/env python
"""
Smoke test script executing end-to-end clinical ML inference using the production inference pipeline.
"""

import sys
import logging
from pathlib import Path

# Add backend root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.ml.inference.predictor import MLInferenceService
from app.ml.inference.feature_contract import DiabetesRiskFeatures

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("matrigluco.scripts.smoke_test")


def run_smoke_tests() -> None:
    logger.info("Initializing MLInferenceService smoke test...")
    service = MLInferenceService()

    test_cases = [
        {
            "name": "Typical Low Risk Case",
            "features": {
                "pregnancies": 1,
                "glucose": 95.0,
                "blood_pressure": 70.0,
                "skin_thickness": 20.0,
                "insulin": 75.0,
                "bmi": 22.5,
                "diabetes_pedigree_function": 0.25,
                "age": 24,
            },
            "expected_band": "low",
        },
        {
            "name": "Typical Moderate Risk Case",
            "features": {
                "pregnancies": 3,
                "glucose": 135.0,
                "blood_pressure": 82.0,
                "skin_thickness": 28.0,
                "insulin": 120.0,
                "bmi": 28.5,
                "diabetes_pedigree_function": 0.45,
                "age": 32,
            },
            "expected_band": "moderate",
        },
        {
            "name": "Typical High Risk Case",
            "features": {
                "pregnancies": 6,
                "glucose": 180.0,
                "blood_pressure": 92.0,
                "skin_thickness": 38.0,
                "insulin": 250.0,
                "bmi": 36.5,
                "diabetes_pedigree_function": 0.95,
                "age": 42,
            },
            "expected_band": "high",
        },
    ]

    all_passed = True
    for case in test_cases:
        logger.info(f"Evaluating: {case['name']}...")
        result = service.evaluate(case["features"])
        logger.info(
            f"  -> Result: {result.prediction_result} | Risk Band: {result.risk_band} "
            f"| Probability: {result.probability:.4f} ({result.probability_score}%)"
        )
        if result.risk_band != case["expected_band"]:
            logger.warning(
                f"  [NOTE] Risk band '{result.risk_band}' differs from expected '{case['expected_band']}'"
            )
            all_passed = False

    if all_passed:
        logger.info("ML Smoke Test execution completed with 100% expected bands.")
    else:
        logger.info("ML Smoke Test execution completed.")


if __name__ == "__main__":
    run_smoke_tests()
