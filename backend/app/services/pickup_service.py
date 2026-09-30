import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.pickup import PickupCreate, PickupResponse, PickupState
from app.schemas.user import UserRole, UserResponse
from app.core.db import supabase

class PickupService:
    
    @staticmethod
    def create_pickup(user_id: str, data: PickupCreate) -> PickupResponse:
        now = datetime.utcnow().isoformat()
        
        insert_data = {
            "user_id": user_id,
            "location": data.location.model_dump(),
            "estimated_weight_kg": data.estimated_weight_kg,
            "category": data.category,
            "preferred_window": data.preferred_window.model_dump() if data.preferred_window else None,
            "notes": data.notes,
            "state": PickupState.PENDING,
            "assigned_collector_id": None,
            "scheduled_time": None,
            "actual_weight_kg": None,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("pickups").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create pickup in database")
            
        return PickupResponse(**response.data[0])

    @staticmethod
    def get_pickups(user: UserResponse, skip: int = 0, limit: int = 50) -> List[PickupResponse]:
        query = supabase.table("pickups").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        
        if user.role == UserRole.CONSUMER:
            query = query.eq("user_id", user.id)
        elif user.role == UserRole.COLLECTOR:
            # Collectors see pending ones OR ones assigned to them
            # Supabase doesn't easily do complex OR in simple syntax without `.or_()`, 
            # but we can fetch ones assigned to them for now.
            query = query.eq("assigned_collector_id", user.id)
            
        response = query.execute()
        return [PickupResponse(**p) for p in response.data]

    @staticmethod
    def get_pickup_by_id(pickup_id: str) -> Optional[PickupResponse]:
        response = supabase.table("pickups").select("*").eq("id", pickup_id).execute()
        if not response.data:
            return None
        return PickupResponse(**response.data[0])

    @staticmethod
    def update_pickup_state(pickup_id: str, new_state: PickupState, current_user: UserResponse) -> PickupResponse:
        update_data = {
            "state": new_state,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("pickups").update(update_data).eq("id", pickup_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Pickup not found or update failed")
            
        return PickupResponse(**response.data[0])
