from fastapi import APIRouter
from app.api.v1.endpoints import auth

api_router = APIRouter()

# Include the Authentication Router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include the Waste Reports Router
from app.api.v1.endpoints import waste_reports
api_router.include_router(waste_reports.router, prefix="/reports", tags=["reports"])

# Include the Pickups Router
from app.api.v1.endpoints import pickups
api_router.include_router(pickups.router, prefix="/pickups", tags=["pickups"])

# Include the Dispatch (ML Routing) Router
from app.api.v1.endpoints import dispatch
api_router.include_router(dispatch.router, prefix="/dispatch", tags=["dispatch"])
