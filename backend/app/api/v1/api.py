from fastapi import APIRouter
from app.api.v1.endpoints import auth

api_router = APIRouter()

# Include the Authentication Router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Example placeholder for future routes
# from app.api.v1.endpoints import waste_reports
# api_router.include_router(waste_reports.router, prefix="/reports", tags=["reports"])
