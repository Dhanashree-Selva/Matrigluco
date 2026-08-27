from typing import Tuple, Dict, Any, Optional

DEFAULT_THRESHOLDS = {
    "low_max": 0.33,
    "moderate_max": 0.66,
}


def classify_risk_band(
    probability: float,
    thresholds: Optional[Dict[str, float]] = None,
) -> Tuple[str, str]:
    """
    Classifies raw positive-class probability [0.0, 1.0] into clinical prediction result and risk band.

    Returns:
        Tuple of (prediction_result: str, risk_band: str)
        where prediction_result is 'Diabetic' | 'Non-Diabetic'
        and risk_band is 'low' | 'moderate' | 'high'
    """
    th = thresholds or DEFAULT_THRESHOLDS
    low_max = float(th.get("low_max", 0.33))
    moderate_max = float(th.get("moderate_max", 0.66))

    if probability <= low_max:
        risk_band = "low"
    elif probability <= moderate_max:
        risk_band = "moderate"
    else:
        risk_band = "high"

    prediction_result = "Diabetic" if probability >= 0.50 else "Non-Diabetic"
    return prediction_result, risk_band


def format_risk_level_display(risk_band: str) -> str:
    """Helper for user-facing UI formatting (e.g. 'low' -> 'Low Risk')."""
    mapping = {
        "low": "Low Risk",
        "moderate": "Moderate Risk",
        "high": "High Risk",
    }
    return mapping.get(risk_band.lower(), f"{risk_band.capitalize()} Risk")
