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
        
        # Map category string to an ID for the DB
        cat_map = {"TEXTILE": 1, "PLASTIC": 2, "E-WASTE": 3, "PAPER": 4, "GLASS": 5, "METAL": 6}
        cat_id = cat_map.get(data.category.upper(), 1) if data.category else 1
        
        insert_data = {
            "requester_id": user_id,
            # For PostGIS columns via PostgREST, a WKT string works well:
            "location": f"POINT({data.location.coordinates[0]} {data.location.coordinates[1]})" if data.location and data.location.coordinates else "POINT(0 0)",
            "estimated_weight_kg": data.estimated_weight_kg,
            "category_id": cat_id,
            "scheduled_window_start": getattr(data.preferred_window, 'start_time', now) if data.preferred_window else now,
            "scheduled_window_end": getattr(data.preferred_window, 'end_time', now) if data.preferred_window else now,
            "status": PickupState.PENDING,
            "collector_id": None,
            "actual_weight_kg": None,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("pickup_requests").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create pickup in database")
            
        return PickupResponse(**response.data[0])

    @staticmethod
    def get_pickups(user: UserResponse, skip: int = 0, limit: int = 50) -> List[PickupResponse]:
        query = supabase.table("pickup_requests").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        
        if user.role == UserRole.CONSUMER:
            query = query.eq("requester_id", user.id)
        elif user.role == UserRole.COLLECTOR:
            # Collectors see pending ones OR ones assigned to them
            # Supabase doesn't easily do complex OR in simple syntax without `.or_()`, 
            # but we can fetch ones assigned to them for now.
            query = query.eq("collector_id", user.id)
            
        response = query.execute()
        return [PickupResponse(**p) for p in response.data]

    @staticmethod
    def get_pickup_by_id(pickup_id: str) -> Optional[PickupResponse]:
        response = supabase.table("pickup_requests").select("*").eq("id", pickup_id).execute()
        if not response.data:
            return None
        return PickupResponse(**response.data[0])

    @staticmethod
    def update_pickup_state(pickup_id: str, new_state: PickupState, current_user: UserResponse) -> PickupResponse:
        update_data = {
            "status": new_state,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("pickup_requests").update(update_data).eq("id", pickup_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Pickup not found or update failed")
            
        return PickupResponse(**response.data[0])
