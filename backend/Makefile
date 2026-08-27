.PHONY: help install verify dev worker worker-threads beat migrate test lint clean train-ml smoke-ai smoke-ml

help:
	@echo "MatriGluco Backend Tasks:"
	@echo "  make verify         - Verify environment, storage, and models"
	@echo "  make install        - Install development dependencies"
	@echo "  make dev            - Run FastAPI dev server via Uvicorn"
	@echo "  make worker         - Run Celery worker (all queues: default, reports, notifications, analytics)"
	@echo "  make worker-threads - Run Celery worker with threads pool"
	@echo "  make beat           - Run Celery Beat periodic scheduler"
	@echo "  make migrate        - Apply Alembic migrations"
	@echo "  make test           - Run pytest test suite"
	@echo "  make lint           - Run ruff linter and mypy"
	@echo "  make smoke-ml       - Smoke test ML inference"
	@echo "  make smoke-ai       - Smoke test offline AI chatbot runtime"

verify:
	python scripts/verify_environment.py

install:
	python -m pip install --upgrade pip
	pip install -r requirements/dev.txt

dev:
	uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

worker:
	celery -A app.workers.celery_app.celery_app worker --loglevel=INFO --queues=default,reports,notifications,analytics

worker-threads:
	celery -A app.workers.celery_app.celery_app worker --loglevel=INFO --pool=threads --concurrency=4 --queues=default,reports,notifications,analytics

beat:
	celery -A app.workers.celery_app.celery_app beat --loglevel=INFO

migrate:
	alembic upgrade head

test:
	pytest -v

lint:
	ruff check app
	mypy app

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +

smoke-ml:
	python scripts/ml/smoke_test_model.py

smoke-ai:
	python scripts/ai/smoke_test_llm.py
