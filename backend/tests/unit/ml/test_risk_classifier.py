import pytest
from app.ml.inference.risk_classifier import classify_risk_band, format_risk_level_display


def test_classify_risk_band_boundaries():
    """Verifies threshold boundary classifications at 0.33, 0.50, and 0.66."""
    thresholds = {"low_max": 0.33, "moderate_max": 0.66}

    # Low risk
    pred_res, band = classify_risk_band(0.20, thresholds)
    assert band == "low"
    assert pred_res == "Non-Diabetic"

    # Exact low boundary
    pred_res, band = classify_risk_band(0.33, thresholds)
    assert band == "low"
    assert pred_res == "Non-Diabetic"

    # Just above low boundary -> moderate
    pred_res, band = classify_risk_band(0.33001, thresholds)
    assert band == "moderate"
    assert pred_res == "Non-Diabetic"

    # Moderate but diabetic classification (prob >= 0.50)
    pred_res, band = classify_risk_band(0.55, thresholds)
    assert band == "moderate"
    assert pred_res == "Diabetic"

    # Exact moderate boundary
    pred_res, band = classify_risk_band(0.66, thresholds)
    assert band == "moderate"
    assert pred_res == "Diabetic"

    # High risk
    pred_res, band = classify_risk_band(0.75, thresholds)
    assert band == "high"
    assert pred_res == "Diabetic"


def test_format_risk_level_display():
    """Verifies UI string formatting."""
    assert format_risk_level_display("low") == "Low Risk"
    assert format_risk_level_display("moderate") == "Moderate Risk"
    assert format_risk_level_display("high") == "High Risk"
