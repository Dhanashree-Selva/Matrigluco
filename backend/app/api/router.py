from fastapi import APIRouter
from .endpoints import prediction, reports, tracking, auth, appointments

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(prediction.router, prefix="/prediction", tags=["prediction"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
