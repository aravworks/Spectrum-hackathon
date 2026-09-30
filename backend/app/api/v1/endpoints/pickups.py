from typing import List, Any
from fastapi import APIRouter, Depends

from app.schemas.pickup import PickupCreate, PickupResponse
from app.schemas.user import UserResponse
from app.api import deps
from app.services.pickup_service import PickupService

router = APIRouter()

@router.post("/", response_model=PickupResponse, status_code=201)
def request_pickup(
    *,
    pickup_in: PickupCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Consumer requests a new waste pickup.
    """
    pickup = PickupService.create_pickup(user_id=current_user.id, data=pickup_in)
    return pickup

@router.get("/", response_model=List[PickupResponse])
def get_pickups(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve pickup requests.
    Consumers see their own. Admins see all.
    """
    pickups = PickupService.get_pickups_for_user(user=current_user, skip=skip, limit=limit)
    return pickups
