from fastapi import FastAPI
from app.core.exceptions import register_exception_handlers

# Re-export registration helper for clean architecture
setup_exception_handlers = register_exception_handlers
