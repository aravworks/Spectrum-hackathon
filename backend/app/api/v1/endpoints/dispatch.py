from typing import Any
from fastapi import APIRouter, Depends

from app.schemas.dispatch import DispatchRunResponse
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.dispatch_service import DispatchService

router = APIRouter()

@router.post("/run", response_model=DispatchRunResponse)
def run_dispatch_optimization(
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Triggers the ML Route Optimizer.
    Fetches all PENDING pickup requests, loads available vehicles, 
    and generates optimized route schedules. 
    Restricted to CITY_ADMIN and SYS_ADMIN.
    """
    result = DispatchService.run_optimization()
    return result
