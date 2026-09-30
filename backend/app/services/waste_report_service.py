import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.waste_report import (
    WasteReportCreate, 
    WasteReportResponse, 
    WasteReportState
)
from app.schemas.user import UserRole, UserResponse
from app.core.db import supabase

class WasteReportService:
    """
    Abstracts database operations for Waste Reports using the Supabase SDK.
    """

    @staticmethod
    def create_report(user_id: str, data: WasteReportCreate) -> WasteReportResponse:
        """Create a new waste report."""
        now = datetime.utcnow().isoformat()
        
        insert_data = {
            "reporter_id": user_id,
            "location": data.location.model_dump(),
            "description": data.description,
            "category": data.category,
            "image_url": data.image_url,
            "estimated_weight_kg": data.estimated_weight_kg,
            "state": WasteReportState.SUBMITTED,
            "admin_notes": None,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("waste_reports").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create waste report in database")
            
        return WasteReportResponse(**response.data[0])

    @staticmethod
    def get_report_by_id(report_id: str) -> Optional[WasteReportResponse]:
        """Fetch a specific report."""
        response = supabase.table("waste_reports").select("*").eq("id", report_id).execute()
        if not response.data:
            return None
        return WasteReportResponse(**response.data[0])

    @staticmethod
    def get_reports_for_user(user: UserResponse, skip: int = 0, limit: int = 50) -> List[WasteReportResponse]:
        """
        Admins see all reports. Consumers see only their own.
        """
        query = supabase.table("waste_reports").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        
        if user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.ANALYST]:
            query = query.eq("reporter_id", user.id)
            
        response = query.execute()
        return [WasteReportResponse(**r) for r in response.data]

    @staticmethod
    def update_report_state(report_id: str, new_state: WasteReportState, admin_notes: Optional[str] = None) -> WasteReportResponse:
        """Update the state of a report (Admin only)."""
        response = supabase.table("waste_reports").select("*").eq("id", report_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Report not found")
            
        update_data = {
            "state": new_state,
            "updated_at": datetime.utcnow().isoformat()
        }
        if admin_notes is not None:
            update_data["admin_notes"] = admin_notes
            
        update_res = supabase.table("waste_reports").update(update_data).eq("id", report_id).execute()
        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update report state")
            
        return WasteReportResponse(**update_res.data[0])
