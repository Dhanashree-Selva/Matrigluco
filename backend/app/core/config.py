import os
import json
import re
from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Union, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator


class Settings(BaseSettings):
    """
    Authoritative, strongly-typed application configuration for MatriGluco.
    Loads from environment variables and local .env files with fail-fast validation.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # ── Application Runtime ───────────────────────────────────────────────────
    APP_NAME: str = "Matrigluco"
    APP_ENV: str = "development"  # development | testing | production
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    FRONTEND_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # ── Database Persistence (MySQL / MariaDB via PyMySQL) ────────────────────
    DATABASE_URL: Optional[str] = None
    MYSQL_HOST: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "matrigluco_app"
    MYSQL_PASSWORD: str = ""
    MYSQL_DB: str = "matrigluco"

    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE_SECONDS: int = 1800
    DB_POOL_PRE_PING: bool = True

    # ── Authentication & Cryptography (Argon2id + JWT) ────────────────────────
    JWT_SECRET_KEY: str = "matrigluco_super_secret_jwt_key_2026_dev_only_change_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 4

    # ── Transient Caching & Message Queue (Redis) ─────────────────────────────
    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    CACHE_ENABLED: bool = True
    CACHE_DEFAULT_TTL_SECONDS: int = 300
    REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS: float = 2.0
    REDIS_SOCKET_TIMEOUT: float = 2.0
    REDIS_MAX_CONNECTIONS: int = 10
    REDIS_REQUIRED: bool = False

    RATE_LIMIT_ENABLED: bool = True
    IDEMPOTENCY_ENABLED: bool = True
    IDEMPOTENCY_DEFAULT_TTL_SECONDS: int = 900
    DISTRIBUTED_LOCK_ENABLED: bool = True
    REPORT_PROCESSING_LOCK_TTL_SECONDS: int = 300

    # ── Asynchronous Background Processing (Celery) ───────────────────────────
    CELERY_BROKER_URL: str = "redis://127.0.0.1:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://127.0.0.1:6379/2"
    CELERY_RESULT_EXPIRES_SECONDS: int = 3600
    CELERY_TASK_ALWAYS_EAGER: bool = False

    # ── Private Storage & Upload Settings ─────────────────────────────────────
    STORAGE_PROVIDER: str = "local"
    STORAGE_ROOT: Path = Path("storage")
    PRIVATE_STORAGE_ROOT: Path = Path("storage/private")
    GENERATED_STORAGE_ROOT: Path = Path("storage/generated")
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_REPORT_MIME_TYPES: Union[List[str], str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
    ]

    # ── Clinical Machine Learning ─────────────────────────────────────────────
    ML_MODEL_KEY: str = "diabetes-risk"
    ML_MODEL_VERSION: str = "1.0.0"
    ML_ARTIFACT_ROOT: Path = Path("app/ml/artifacts")
    ML_PRELOAD: bool = True

    # ── Local Offline AI Chatbot (llama.cpp / GGUF) ───────────────────────────
    AI_ENABLED: bool = True
    AI_MODEL_PATH: Path = Path("storage/ai/models/model.gguf")
    AI_MODEL_NAME: str = "llama-3.2-3b-instruct"
    AI_MODEL_VERSION: str = "1.0.0"
    AI_MODEL_CHECKSUM: Optional[str] = None
    AI_PRELOAD_MODEL: bool = False

    AI_CONTEXT_SIZE: int = 4096
    AI_MAX_OUTPUT_TOKENS: int = 512
    AI_TEMPERATURE: float = 0.2
    AI_TOP_P: float = 0.9
    AI_TOP_K: int = 40
    AI_THREADS: Optional[int] = None
    AI_BATCH_SIZE: Optional[int] = None
    AI_GPU_LAYERS: int = 0

    # ── AI Knowledge & RAG ────────────────────────────────────────────────────
    AI_KNOWLEDGE_ROOT: Path = Path("storage/private/knowledge-documents")
    AI_INDEX_ROOT: Path = Path("storage/ai/indexes")
    AI_RAG_ENABLED: bool = False
    AI_RAG_TOP_K: int = 5

    # ── OCR Provider ──────────────────────────────────────────────────────────
    OCR_PROVIDER: str = "ocr_space"
    OCR_API_KEY: Optional[str] = None
    OCR_TIMEOUT_SECONDS: int = 5
    OCR_SPACE_URL: str = "https://api.ocr.space/parse/image"

    # ── Logging & Observability ───────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = False
    ENABLE_REQUEST_ID_LOGGING: bool = True

    # ── Email Integration (Optional) ──────────────────────────────────────────
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "alerts@matrigluco.org"

    # ── Field Validators ──────────────────────────────────────────────────────

    @field_validator("APP_ENV")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        valid_envs = ["development", "testing", "production"]
        val = v.lower().strip()
        if val not in valid_envs:
            raise ValueError(f"Invalid APP_ENV '{v}'. Must be one of {valid_envs}")
        return val

    @field_validator("FRONTEND_ORIGINS", mode="before")
    @classmethod
    def parse_frontend_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v if str(i).strip()]
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("ALLOWED_REPORT_MIME_TYPES", mode="before")
    @classmethod
    def parse_mime_types(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v if str(i).strip()]
        return ["application/pdf", "image/jpeg", "image/png"]

    @field_validator(
        "DB_POOL_SIZE",
        "DB_POOL_RECYCLE_SECONDS",
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "REFRESH_TOKEN_EXPIRE_DAYS",
        "CACHE_DEFAULT_TTL_SECONDS",
        "MAX_UPLOAD_SIZE_MB",
    )
    @classmethod
    def validate_positive_integers(cls, v: int, info: Any) -> int:
        if v <= 0:
            raise ValueError(f"{info.field_name} must be a positive integer greater than 0.")
        return v

    @field_validator("DB_MAX_OVERFLOW", "AI_GPU_LAYERS", "AI_TOP_K")
    @classmethod
    def validate_non_negative_integers(cls, v: int, info: Any) -> int:
        if v < 0:
            raise ValueError(f"{info.field_name} must be greater than or equal to 0.")
        return v

    @field_validator("AI_CONTEXT_SIZE", "AI_MAX_OUTPUT_TOKENS")
    @classmethod
    def validate_positive_tokens(cls, v: int, info: Any) -> int:
        if v <= 0:
            raise ValueError(f"{info.field_name} must be greater than 0.")
        return v

    @field_validator("AI_TEMPERATURE")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        if v < 0.0:
            raise ValueError("AI_TEMPERATURE must be non-negative (>= 0.0).")
        return v

    @field_validator("AI_TOP_P")
    @classmethod
    def validate_top_p(cls, v: float) -> float:
        if not (0.0 < v <= 1.0):
            raise ValueError("AI_TOP_P must be in range (0.0, 1.0].")
        return v

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        val = v.upper().strip()
        if val not in valid_levels:
            raise ValueError(f"Invalid LOG_LEVEL '{v}'. Must be one of {valid_levels}")
        return val

    @field_validator("ML_MODEL_KEY", "ML_MODEL_VERSION")
    @classmethod
    def validate_safe_identifier(cls, v: str, info: Any) -> str:
        if ".." in v or "/" in v or "\\" in v:
            raise ValueError(
                f"{info.field_name} must not contain directory traversal characters ('..', '/', '\\')."
            )
        return v

    # ── Model-Level Security Validators ───────────────────────────────────────

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        """Enforces strict security invariants in production mode."""
        if self.APP_ENV == "production":
            if self.DEBUG:
                raise ValueError("Security Violation: DEBUG must be False in production mode.")

            insecure_placeholders = [
                "GENERATE_A_LONG_RANDOM_SECRET",
                "secret",
                "password",
                "CHANGE_ME",
                "matrigluco123",
                "matrigluco_super_secret_jwt_key_2026_dev_only_change_in_prod",
            ]

            if (
                not self.JWT_SECRET_KEY
                or self.JWT_SECRET_KEY in insecure_placeholders
                or len(self.JWT_SECRET_KEY) < 32
            ):
                raise ValueError(
                    "Security Violation: JWT_SECRET_KEY must be a secure, non-placeholder secret (min 32 characters) in production."
                )

            if self.DATABASE_URL and "CHANGE_ME" in self.DATABASE_URL:
                raise ValueError(
                    "Security Violation: DATABASE_URL contains placeholder password in production."
                )

        return self

    # ── Computed Properties ───────────────────────────────────────────────────

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@"
            f"{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"
        )

    @property
    def database_url_safe(self) -> str:
        """Returns database URL with password redacted for safe operational logging."""
        url = self.sync_database_url
        return re.sub(r":([^:@]+)@", ":***@", url)

    # ── Compatibility Aliases ─────────────────────────────────────────────────

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return (
            self.FRONTEND_ORIGINS
            if isinstance(self.FRONTEND_ORIGINS, list)
            else [str(self.FRONTEND_ORIGINS)]
        )

    @property
    def PRIVATE_STORAGE_PATH(self) -> str:
        return str(self.PRIVATE_STORAGE_ROOT)

    @property
    def GENERATED_STORAGE_PATH(self) -> str:
        return str(self.GENERATED_STORAGE_ROOT)

    @property
    def DIABETES_MODEL_VERSION(self) -> str:
        return self.ML_MODEL_VERSION

    @property
    def DB_POOL_RECYCLE(self) -> int:
        return self.DB_POOL_RECYCLE_SECONDS


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Cached application settings factory.
    Use get_settings.cache_clear() during test teardown if overriding environment.
    """
    return Settings()
