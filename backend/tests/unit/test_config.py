import pytest
from pydantic import ValidationError
from app.core.config import Settings, get_settings


def test_default_settings():
    """Validates default settings instantiation in development mode."""
    settings = Settings()
    assert settings.APP_NAME in ["Matrigluco", "MatriGluco API"]
    assert settings.APP_ENV == "development"
    assert settings.DEBUG is True
    assert settings.API_V1_PREFIX == "/api/v1"
    assert len(settings.FRONTEND_ORIGINS) >= 1
    assert "mysql+pymysql://" in settings.sync_database_url


def test_cors_frontend_origins_parsing():
    """Parses comma-separated string into list of origin URLs."""
    settings = Settings(FRONTEND_ORIGINS="http://test.com, https://app.example.com")
    assert "http://test.com" in settings.FRONTEND_ORIGINS
    assert "https://app.example.com" in settings.FRONTEND_ORIGINS
    assert len(settings.FRONTEND_ORIGINS) == 2


def test_database_url_custom_override_and_masking():
    """Verifies custom database URL override and safe masking property."""
    custom_url = "mysql+pymysql://testuser:super_secret_pw@127.0.0.1:3306/testdb?charset=utf8mb4"
    settings = Settings(DATABASE_URL=custom_url)
    assert settings.sync_database_url == custom_url
    assert "super_secret_pw" not in settings.database_url_safe
    assert "***" in settings.database_url_safe


def test_invalid_app_env_rejected():
    """Rejects invalid APP_ENV values."""
    with pytest.raises(ValidationError):
        Settings(APP_ENV="invalid_env_name")


def test_invalid_database_pool_size_rejected():
    """Rejects zero or negative DB pool size."""
    with pytest.raises(ValidationError):
        Settings(DB_POOL_SIZE=0)
    with pytest.raises(ValidationError):
        Settings(DB_POOL_SIZE=-5)


def test_invalid_token_expiry_rejected():
    """Rejects zero or negative token expiry durations."""
    with pytest.raises(ValidationError):
        Settings(ACCESS_TOKEN_EXPIRE_MINUTES=0)
    with pytest.raises(ValidationError):
        Settings(REFRESH_TOKEN_EXPIRE_DAYS=-1)


def test_invalid_redis_ttl_rejected():
    """Rejects non-positive Redis cache TTL."""
    with pytest.raises(ValidationError):
        Settings(CACHE_DEFAULT_TTL_SECONDS=0)


def test_allowed_mime_types_parsing():
    """Parses comma-separated MIME types string into list."""
    settings = Settings(ALLOWED_REPORT_MIME_TYPES="application/pdf, image/png")
    assert settings.ALLOWED_REPORT_MIME_TYPES == ["application/pdf", "image/png"]


def test_ml_model_key_traversal_rejected():
    """Rejects directory traversal in ML model key."""
    with pytest.raises(ValidationError):
        Settings(ML_MODEL_KEY="../../malicious_model")


def test_ai_disabled_missing_gguf_permitted():
    """When AI is disabled, missing GGUF model path is completely permitted."""
    settings = Settings(AI_ENABLED=False, AI_MODEL_PATH="non_existent_path.gguf")
    assert settings.AI_ENABLED is False


def test_ai_invalid_generation_parameters_rejected():
    """Rejects invalid temperature, context size, or top_p values."""
    with pytest.raises(ValidationError):
        Settings(AI_TEMPERATURE=-0.5)
    with pytest.raises(ValidationError):
        Settings(AI_TOP_P=0.0)
    with pytest.raises(ValidationError):
        Settings(AI_TOP_P=1.5)
    with pytest.raises(ValidationError):
        Settings(AI_CONTEXT_SIZE=0)


def test_production_security_enforces_debug_false():
    """Production mode strictly forbids DEBUG=True."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            APP_ENV="production",
            DEBUG=True,
            JWT_SECRET_KEY="a_very_secure_and_long_random_production_secret_key_123456",
        )
    assert "DEBUG must be False in production" in str(exc.value)


def test_production_security_rejects_placeholder_jwt_secret():
    """Production mode strictly forbids default or placeholder JWT secrets."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            APP_ENV="production",
            DEBUG=False,
            JWT_SECRET_KEY="GENERATE_A_LONG_RANDOM_SECRET",
        )
    assert "JWT_SECRET_KEY" in str(exc.value)

    with pytest.raises(ValidationError) as exc:
        Settings(
            APP_ENV="production",
            DEBUG=False,
            JWT_SECRET_KEY="short",
        )
    assert "JWT_SECRET_KEY" in str(exc.value)


def test_production_security_accepts_valid_configuration():
    """Production mode accepts valid secure configuration."""
    settings = Settings(
        APP_ENV="production",
        DEBUG=False,
        JWT_SECRET_KEY="a_very_secure_and_long_random_production_secret_key_123456",
        DATABASE_URL="mysql+pymysql://matrigluco_app:real_prod_pw@db.internal:3306/matrigluco?charset=utf8mb4",
    )
    assert settings.APP_ENV == "production"
    assert settings.DEBUG is False


def test_get_settings_caching_and_clear():
    """Tests settings caching via get_settings() and cache_clear()."""
    get_settings.cache_clear()
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2
    get_settings.cache_clear()
