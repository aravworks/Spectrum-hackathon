from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.footprint import (
    SimulationRequest,
    SimulationResponse,
    FootprintCalculationCreate,
    FootprintCalculationResponse,
    AggregateFootprintResponse
)
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.footprint_service import FootprintService

router = APIRouter()

@router.post("/simulate", response_model=SimulationResponse)
def simulate_emissions(
    request: SimulationRequest,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Simulate emissions for a given waste category and weight.
    This does NOT save the calculation to the database.
    Used by the Carbon/Methane Frontend Simulator.
    """
    return FootprintService.simulate(request)

@router.post("/calculate", response_model=FootprintCalculationResponse, status_code=201)
def calculate_and_save_emissions(
    request: FootprintCalculationCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Calculate and permanently store the environmental footprint.
    Usually triggered by the backend internally when a pickup is marked COMPLETED.
    """
    # For a real system, you might restrict this to COLLECTOR or SYSTEM roles.
    return FootprintService.calculate_and_save(user_id=current_user.id, data=request)

@router.get("/user/{target_user_id}", response_model=AggregateFootprintResponse)
def get_user_footprint(
    target_user_id: str,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get the total lifetime aggregated footprint for a specific consumer.
    """
    # Authorization: Users can only see their own footprint unless they are an admin.
    if target_user_id != current_user.id and current_user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's data")
        
    return FootprintService.aggregate_for_user(target_user_id)

@router.get("/city/{city_id}", response_model=AggregateFootprintResponse)
def get_city_footprint(
    city_id: int,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.ANALYST, UserRole.RESEARCHER]))
) -> Any:
    """
    Get the total lifetime aggregated footprint for a municipality.
    Restricted to Admins, Analysts, and Researchers.
    """
    return FootprintService.aggregate_for_city(city_id)
