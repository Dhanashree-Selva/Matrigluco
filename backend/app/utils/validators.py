from typing import Optional


def validate_glucose_range(glucose: float) -> bool:
    """Validates that glucose is in standard physiological bounds (20 to 600 mg/dL)."""
    return 20.0 <= glucose <= 600.0


def validate_bmi_range(bmi: float) -> bool:
    """Validates BMI in physiological bounds (10 to 70 kg/m²)."""
    return 10.0 <= bmi <= 70.0


def validate_blood_pressure_range(systolic: float, diastolic: Optional[float] = None) -> bool:
    """Validates blood pressure numbers."""
    if not (40.0 <= systolic <= 260.0):
        return False
    if diastolic is not None and not (30.0 <= diastolic <= 180.0):
        return False
    return True
