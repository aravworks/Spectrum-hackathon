from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.pickup import PickupCreate
from app.schemas.user import UserResponse
from app.api import deps
from app.services.pickup_service import PickupService

router = APIRouter()


@router.post("/", status_code=201)
def request_pickup(
    *,
    pickup_in: PickupCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """Consumer requests a new waste pickup."""
    try:
        pickup = PickupService.create_pickup(user_id=current_user.id, data=pickup_in)
        return pickup
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create pickup: {str(e)}")


@router.get("/")
def get_pickups(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve pickup requests. Consumers see their own. Admins see all."""
    try:
        pickups = PickupService.get_pickups_for_user(user=current_user, skip=skip, limit=limit)
        return pickups
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pickups: {str(e)}")
