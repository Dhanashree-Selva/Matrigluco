from enum import Enum


class Environment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    DOCTOR = "doctor"


class AccountStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class RiskLevel(str, Enum):
    LOW = "Low Risk"
    MODERATE = "Moderate Risk"
    HIGH = "High Risk"
    CRITICAL = "Critical Risk"


class PredictionResult(str, Enum):
    DIABETIC = "Diabetic"
    NON_DIABETIC = "Non-Diabetic"
    UNKNOWN = "Unknown"


class AppointmentStatus(str, Enum):
    BOOKED = "booked"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ConsultationType(str, Enum):
    VIDEO = "Video Consultation"
    IN_PERSON = "In-Person Consultation"
    CHAT = "Chat Consultation"
