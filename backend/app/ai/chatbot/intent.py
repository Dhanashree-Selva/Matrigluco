from enum import Enum


class ChatIntent(str, Enum):
    CLINICAL_GDM = "clinical_gdm"
    NUTRITION = "nutrition"
    PREGNANCY_GENERAL = "pregnancy_general"
    EMERGENCY = "emergency"
    GENERAL = "general"


def detect_chat_intent(message: str) -> ChatIntent:
    """Classifies user maternal query intent."""
    msg = message.lower()
    if any(k in msg for k in ["bleeding", "severe pain", "emergency", "convulsion", "water broke"]):
        return ChatIntent.EMERGENCY
    if any(k in msg for k in ["diet", "food", "eat", "meal", "carb", "snack", "recipe"]):
        return ChatIntent.NUTRITION
    if any(
        k in msg for k in ["glucose", "sugar", "insulin", "fasting", "postprandial", "hba1c", "gdm"]
    ):
        return ChatIntent.CLINICAL_GDM
    if any(k in msg for k in ["trimester", "week", "kick", "movement", "due date"]):
        return ChatIntent.PREGNANCY_GENERAL
    return ChatIntent.GENERAL
