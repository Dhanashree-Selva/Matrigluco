import ast
import os
from pathlib import Path
import pytest

BACKEND_APP_DIR = Path(__file__).resolve().parent.parent.parent / "app"


def get_imports_from_file(file_path: Path) -> list[str]:
    """Parses a python file and returns all imported module names."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(file_path))
    except Exception:
        return []

    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)
    return imports


def test_models_have_no_forbidden_dependencies():
    """Models must define persistence mapping only; no API, Service, Celery, or Redis imports."""
    models_dir = BACKEND_APP_DIR / "models"
    forbidden_prefixes = [
        "app.api",
        "app.services",
        "app.workers",
        "app.tasks",
        "celery",
        "redis",
        "llama_cpp",
    ]

    for py_file in models_dir.glob("*.py"):
        if py_file.name == "__init__.py":
            continue
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: models must not import '{imp}'."
                )


def test_repositories_have_no_api_or_http_dependencies():
    """Repositories must contain persistence logic only; no API or FastAPI imports."""
    repos_dir = BACKEND_APP_DIR / "repositories"
    forbidden_prefixes = ["app.api", "fastapi.HTTPException", "starlette.responses"]

    for py_file in repos_dir.glob("*.py"):
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: repository must not import '{imp}'."
                )


def test_schemas_have_no_persistence_dependencies():
    """Schemas define API contracts; no ORM session, repositories, or services."""
    schemas_dir = BACKEND_APP_DIR / "schemas"
    forbidden_prefixes = [
        "app.repositories",
        "app.services",
        "app.workers",
        "sqlalchemy.orm.Session",
    ]

    for py_file in schemas_dir.glob("*.py"):
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: schema must not import '{imp}'."
                )


def test_ml_inference_has_no_api_dependencies():
    """ML inference owns model evaluation; no API or HTTP framework dependencies."""
    ml_inf_dir = BACKEND_APP_DIR / "ml" / "inference"
    forbidden_prefixes = ["app.api", "fastapi", "starlette"]

    for py_file in ml_inf_dir.glob("*.py"):
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: ML inference must not import '{imp}'."
                )


def test_ai_runtime_has_no_api_or_service_dependencies():
    """AI runtime is pure local LLM infrastructure; no API or service imports."""
    ai_runtime_dir = BACKEND_APP_DIR / "ai" / "runtime"
    forbidden_prefixes = ["app.api", "app.services", "fastapi", "starlette"]

    for py_file in ai_runtime_dir.glob("*.py"):
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: AI runtime must not import '{imp}'."
                )


def test_v1_endpoints_have_no_raw_ml_or_direct_llama_imports():
    """Endpoints must delegate to services and not instantiate llama.cpp or pickle models directly."""
    endpoints_dir = BACKEND_APP_DIR / "api" / "v1" / "endpoints"
    forbidden_prefixes = ["llama_cpp", "pickle", "joblib"]

    for py_file in endpoints_dir.glob("*.py"):
        imports = get_imports_from_file(py_file)
        for imp in imports:
            for forbidden in forbidden_prefixes:
                assert not imp.startswith(forbidden), (
                    f"Architecture Violation in {py_file.name}: Endpoint must not import '{imp}'."
                )
