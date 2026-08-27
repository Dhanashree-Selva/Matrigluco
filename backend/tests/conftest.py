import os
import shutil
import tempfile
from pathlib import Path
from typing import Generator
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import create_app
from app.core.config import Settings, get_settings
from app.db.base import Base
from app.db.session import get_db
from app.storage.local import LocalStorageService
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


@pytest.fixture
def test_engine():
    """Function-scoped in-memory SQLite engine for complete test isolation."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine) -> Generator[Session, None, None]:
    """Provides a fresh isolated database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Provides test-configured application settings."""
    return Settings(
        APP_NAME="MatriGluco Test API",
        APP_ENV="testing",
        DEBUG=True,
        DATABASE_URL="sqlite:///:memory:",
        STORAGE_ROOT=Path(tempfile.mkdtemp()),
        LOG_LEVEL="DEBUG",
        JWT_SECRET_KEY="test_super_secret_jwt_key_for_unit_tests_only_12345",
    )


@pytest.fixture
def app(test_settings: Settings, db_session: Session):
    """Initializes FastAPI test application instance with database override."""
    app_instance = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app_instance.dependency_overrides[get_settings] = lambda: test_settings
    app_instance.dependency_overrides[get_db] = override_get_db
    return app_instance


@pytest.fixture
def client(app) -> Generator[TestClient, None, None]:
    """Test client for HTTP API integration testing."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def temp_storage(tmp_path: Path) -> Generator[LocalStorageService, None, None]:
    """Provides an isolated LocalStorageService for unit tests."""
    storage_dir = tmp_path / "test_storage"
    service = LocalStorageService(root_dir=storage_dir)
    yield service
    if storage_dir.exists():
        shutil.rmtree(storage_dir, ignore_errors=True)


# ─── Auth User Test Fixtures ──────────────────────────────────────────────────


@pytest.fixture
def test_user_a(db_session: Session) -> User:
    user = User(
        email="user_a@example.com",
        email_normalized="user_a@example.com",
        password_hash=get_password_hash("Password123!"),
        full_name="Patient User A",
        role="user",
        status="active",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_b(db_session: Session) -> User:
    user = User(
        email="user_b@example.com",
        email_normalized="user_b@example.com",
        password_hash=get_password_hash("Password123!"),
        full_name="Patient User B",
        role="user",
        status="active",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def user_a_token(test_user_a: User) -> str:
    return create_access_token(user_id=test_user_a.id, role=test_user_a.role)


@pytest.fixture
def user_b_token(test_user_b: User) -> str:
    return create_access_token(user_id=test_user_b.id, role=test_user_b.role)
