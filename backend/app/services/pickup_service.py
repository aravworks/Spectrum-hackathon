from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.pickup import PickupCreate, PickupResponse, PickupState
from app.schemas.user import UserRole, UserResponse
from app.core.db import supabase


def _map_pickup_row(row: dict) -> dict:
    """Safely map a DB pickup_requests row to the PickupResponse schema shape."""
    return {
        "id": str(row.get("id", "")),
        "user_id": str(row.get("requester_id", "") or ""),
        "state": row.get("status", "PENDING"),
        "category": "PLASTIC",
        "estimated_weight_kg": float(row.get("estimated_weight_kg") or 0.0),
        "location": {"address": "Saved Location", "coordinates": [0, 0]},
        "preferred_window": None,
        "notes": row.get("notes"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


class PickupService:

    @staticmethod
    def create_pickup(user_id: str, data: PickupCreate) -> dict:
        now = datetime.utcnow().isoformat()

        cat_map = {"TEXTILE": 1, "PLASTIC": 2, "E-WASTE": 3, "PAPER": 4, "GLASS": 5, "METAL": 6, "MIXED": 1}
        cat_id = cat_map.get(str(data.category).upper(), 1) if data.category else 1

        coords = None
        if data.location and hasattr(data.location, "coordinates") and data.location.coordinates:
            coords = data.location.coordinates

        insert_data = {
            "requester_id": user_id,
            "location": f"POINT({coords[0]} {coords[1]})" if coords else "POINT(0 0)",
            "estimated_weight_kg": data.estimated_weight_kg,
            "category_id": cat_id,
            "scheduled_window_start": str(getattr(data.preferred_window, "start_time", now)) if data.preferred_window else now,
            "scheduled_window_end": str(getattr(data.preferred_window, "end_time", now)) if data.preferred_window else now,
            "status": PickupState.PENDING.value,
            "collector_id": None,
            "actual_weight_kg": None,
            "created_at": now,
            "updated_at": now,
        }

        try:
            response = supabase.table("pickup_requests").insert(insert_data).execute()
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create pickup in database")
            return _map_pickup_row(response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB error creating pickup: {str(e)}")

    @staticmethod
    def get_pickups(user: UserResponse, skip: int = 0, limit: int = 50) -> List[dict]:
        query = supabase.table("pickup_requests").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)

        if user.role == UserRole.CONSUMER:
            query = query.eq("requester_id", user.id)
        elif user.role == UserRole.COLLECTOR:
            query = query.eq("collector_id", user.id)

        response = query.execute()
        return [_map_pickup_row(p) for p in response.data]

    # alias used by the endpoint
    @staticmethod
    def get_pickups_for_user(user: UserResponse, skip: int = 0, limit: int = 50) -> List[dict]:
        return PickupService.get_pickups(user=user, skip=skip, limit=limit)

    @staticmethod
    def get_pickup_by_id(pickup_id: str) -> Optional[dict]:
        response = supabase.table("pickup_requests").select("*").eq("id", pickup_id).execute()
        if not response.data:
            return None
        return _map_pickup_row(response.data[0])

    @staticmethod
    def update_pickup_state(pickup_id: str, new_state: PickupState, current_user: UserResponse) -> dict:
        update_data = {
            "status": new_state.value,
            "updated_at": datetime.utcnow().isoformat(),
        }
        response = supabase.table("pickup_requests").update(update_data).eq("id", pickup_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Pickup not found or update failed")
        return _map_pickup_row(response.data[0])
