from typing import Tuple, Optional
from app.ai.safety.medical_scope import check_emergency_symptoms
from app.ai.safety.pii import redact_pii
from app.ai.safety.output_validator import validate_model_output
from app.ai.safety.disclaimers import append_medical_disclaimer


class SafetyGuardrails:
    """
    Orchestrates pre-prompt and post-generation safety guardrails for the maternal health chatbot.
    """

    def process_input(self, user_message: str) -> Tuple[bool, str, Optional[str]]:
        """
        Pre-inference evaluation:
        Checks for medical emergencies and redacts PII.
        Returns (should_short_circuit, processed_prompt, direct_response).
        """
        is_emergency, emergency_msg = check_emergency_symptoms(user_message)
        if is_emergency:
            return True, user_message, emergency_msg

        sanitized_input = redact_pii(user_message)
        return False, sanitized_input, None

    def process_output(self, raw_output: str) -> str:
        """
        Post-inference evaluation:
        Sanitizes prescriptions and appends mandatory clinical disclaimer.
        """
        _, validated = validate_model_output(raw_output)
        return append_medical_disclaimer(validated)


safety_guardrails = SafetyGuardrails()
