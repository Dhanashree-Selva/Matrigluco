from typing import Optional, List, Dict, Any


def format_patient_context_prompt(
    pregnancy_week: Optional[int] = None,
    risk_level: Optional[str] = None,
    due_date: Optional[str] = None,
    blood_group: Optional[str] = None,
    age: Optional[int] = None,
    previous_pregnancies: Optional[int] = None,
    latest_assessment: Optional[Dict[str, Any]] = None,
    recent_measurements: Optional[List[Dict[str, Any]]] = None,
    focused_resource: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Formats verified patient health context into structured tokens for the AI prompt:
    - Maternal profile parameters (gestational age, EDD, blood group)
    - Latest GDM ML Risk Assessment (band, probability, input biomarkers)
    - Recent Health Telemetry & Glucose Measurements (last 7-14 days)
    - Focused clinical resource (specific report, tracking period, or assessment)
    """
    sections = []

    # 1. Maternal Profile
    profile_parts = []
    if pregnancy_week is not None and pregnancy_week > 0:
        profile_parts.append(f"• Gestational Age: Week {pregnancy_week}")
    if due_date:
        profile_parts.append(f"• Estimated Due Date: {due_date}")
    if age is not None:
        profile_parts.append(f"• Maternal Age: {age} years")
    if blood_group:
        profile_parts.append(f"• Blood Group: {blood_group}")
    if previous_pregnancies is not None:
        profile_parts.append(f"• Prior Pregnancies: {previous_pregnancies}")

    if profile_parts:
        sections.append("PATIENT MATERNAL PROFILE:\n" + "\n".join(profile_parts))

    # 2. Latest Risk Assessment
    if latest_assessment:
        assessment_parts = []
        band = latest_assessment.get("risk_band") or risk_level or "Evaluated"
        prob = latest_assessment.get("probability")
        prob_str = f" ({prob * 100:.1f}% probability)" if prob is not None else ""
        assessment_parts.append(f"• Evaluated Risk Level: {band}{prob_str}")

        prediction = latest_assessment.get("prediction_result")
        if prediction:
            assessment_parts.append(f"• Prediction Classification: {prediction}")

        inputs = latest_assessment.get("input_snapshot_json") or {}
        if isinstance(inputs, dict) and inputs:
            key_metrics = []
            if "glucose" in inputs or "Glucose" in inputs:
                val = inputs.get("glucose") or inputs.get("Glucose")
                key_metrics.append(f"Fasting Glucose: {val} mg/dL")
            if "bmi" in inputs or "BMI" in inputs:
                val = inputs.get("bmi") or inputs.get("BMI")
                key_metrics.append(f"BMI: {val}")
            if "blood_pressure" in inputs or "BloodPressure" in inputs:
                val = inputs.get("blood_pressure") or inputs.get("BloodPressure")
                key_metrics.append(f"Blood Pressure: {val} mmHg")
            if "insulin" in inputs or "Insulin" in inputs:
                val = inputs.get("insulin") or inputs.get("Insulin")
                key_metrics.append(f"Insulin: {val} µU/mL")
            if "hba1c" in inputs or "HbA1c" in inputs:
                val = inputs.get("hba1c") or inputs.get("HbA1c")
                key_metrics.append(f"HbA1c: {val}%")

            if key_metrics:
                assessment_parts.append(f"• Assessment Biomarkers: {', '.join(key_metrics)}")

        sections.append("LATEST GESTATIONAL DIABETES RISK ASSESSMENT:\n" + "\n".join(assessment_parts))
    elif risk_level:
        sections.append(f"LATEST GESTATIONAL RISK LEVEL:\n• Evaluated Risk: {risk_level}")

    # 3. Recent Health Telemetry & Glucose Measurements
    if recent_measurements and len(recent_measurements) > 0:
        telemetry_lines = []
        for m in recent_measurements[:8]:
            metric = m.get("metric_type", "glucose").replace("_", " ").title()
            val = m.get("value_primary")
            val_sec = m.get("value_secondary")
            unit = m.get("unit", "")
            time_str = m.get("measured_at_formatted") or m.get("measured_at", "")
            notes = f" ({m.get('notes')})" if m.get("notes") else ""

            if val_sec is not None:
                val_str = f"{val}/{val_sec} {unit}"
            else:
                val_str = f"{val} {unit}"

            telemetry_lines.append(f"• [{time_str}] {metric}: {val_str}{notes}")

        sections.append("RECENT HEALTH MEASUREMENTS & GLUCOSE TELEMETRY:\n" + "\n".join(telemetry_lines))

    # 4. Focused Resource Context (if patient clicked 'Ask about this')
    if focused_resource:
        res_type = focused_resource.get("type", "Resource")
        res_details = focused_resource.get("details", "")
        sections.append(f"FOCUSED {res_type.upper()} CONTEXT:\n{res_details}")

    if not sections:
        return ""

    return "\n" + "\n\n".join(sections) + "\n"
