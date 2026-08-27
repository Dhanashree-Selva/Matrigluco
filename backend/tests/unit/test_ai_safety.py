import pytest
from app.ai.safety.medical_scope import check_emergency_symptoms
from app.ai.safety.pii import redact_pii
from app.ai.safety.output_validator import validate_model_output
from app.ai.safety.disclaimers import append_medical_disclaimer
from app.ai.safety.guardrails import safety_guardrails


def test_emergency_symptom_interceptor():
    is_emerg, msg = check_emergency_symptoms("Doctor, I'm having heavy vaginal bleeding")
    assert is_emerg is True
    assert "URGENT MEDICAL NOTICE" in msg

    is_emerg, msg = check_emergency_symptoms("What should I eat for breakfast?")
    assert is_emerg is False
    assert msg == ""


def test_pii_redaction():
    raw_prompt = "My email is sarah.patient@example.com and phone is +1-555-123-4567"
    redacted = redact_pii(raw_prompt)
    assert "[EMAIL_REDACTED]" in redacted
    assert "[PHONE_REDACTED]" in redacted
    assert "sarah.patient@example.com" not in redacted


def test_output_prescription_guard():
    raw_model_out = "You should take 500 mg metformin daily."
    _, sanitized = validate_model_output(raw_model_out)
    assert "[Consult your physician for exact medication dosage]" in sanitized


def test_disclaimer_appending():
    text = "Fasting blood sugar targets are generally under 95 mg/dL."
    with_disclaimer = append_medical_disclaimer(text)
    assert "Disclaimer:" in with_disclaimer
    assert "MatriGluco AI Assistant" in with_disclaimer


def test_guardrails_pipeline_emergency_short_circuit():
    short_circuit, prompt, reply = safety_guardrails.process_input(
        "I have severe abdominal pain and bleeding"
    )
    assert short_circuit is True
    assert reply is not None
    assert "URGENT MEDICAL NOTICE" in reply
