from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    profiles,
    pregnancies,
    predictions,
    health_measurements,
    reports,
    files,
    dashboard,
    notifications,
    consultations,
    history,
    tasks,
    chatbot,
    chatbot_admin,
)

api_router = APIRouter()

# Register core health endpoints
api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Register domain API endpoints
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(pregnancies.router)
api_router.include_router(predictions.router)
api_router.include_router(health_measurements.router)
api_router.include_router(reports.router)
api_router.include_router(files.router)
api_router.include_router(dashboard.router)
api_router.include_router(notifications.router)
api_router.include_router(consultations.router)
api_router.include_router(history.router)
api_router.include_router(tasks.router)
api_router.include_router(chatbot.router)
api_router.include_router(chatbot_admin.router)
