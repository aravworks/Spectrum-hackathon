import uuid
from datetime import datetime
from typing import List, Optional

from app.schemas.pickup import PickupCreate, PickupResponse, PickupState
from app.schemas.user import UserRole, UserResponse

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace with SQLAlchemy queries

MOCK_PICKUPS = {}

class PickupService:
    
    @staticmethod
    def create_pickup(user_id: str, data: PickupCreate) -> PickupResponse:
        pickup_id = f"pu-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        pickup_dict = {
            "id": pickup_id,
            "user_id": user_id,
            "location": data.location.model_dump(),
            "estimated_weight_kg": data.estimated_weight_kg,
            "category": data.category,
            "preferred_window": data.preferred_window.model_dump() if data.preferred_window else None,
            "notes": data.notes,
            "state": PickupState.PENDING,
            "created_at": now,
            "updated_at": now
        }
        
        MOCK_PICKUPS[pickup_id] = pickup_dict
        return PickupResponse(**pickup_dict)

    @staticmethod
    def get_pickups_for_user(user: UserResponse, skip: int = 0, limit: int = 50) -> List[PickupResponse]:
        all_pickups = list(MOCK_PICKUPS.values())
        
        # Admin roles see all; Consumers see only their own
        if user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]:
            all_pickups = [p for p in all_pickups if p["user_id"] == user.id]
            
        all_pickups.sort(key=lambda x: x["created_at"], reverse=True)
        return [PickupResponse(**p) for p in all_pickups[skip : skip + limit]]

    @staticmethod
    def get_unassigned_pickups() -> List[PickupResponse]:
        """Fetch all PENDING pickups to be fed into the routing engine."""
        pending = [p for p in MOCK_PICKUPS.values() if p["state"] == PickupState.PENDING]
        return [PickupResponse(**p) for p in pending]
        
    @staticmethod
    def mark_pickups_assigned(pickup_ids: List[str]):
        """Update state to ASSIGNED after routing runs."""
        for pid in pickup_ids:
            if pid in MOCK_PICKUPS:
                MOCK_PICKUPS[pid]["state"] = PickupState.ASSIGNED
                MOCK_PICKUPS[pid]["updated_at"] = datetime.utcnow()
