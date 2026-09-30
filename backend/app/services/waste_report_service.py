from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.waste_report import WasteReportCreate, WasteReportResponse, WasteReportState
from app.schemas.user import UserRole, UserResponse
from app.core.db import supabase


def _map_report_row(row: dict) -> dict:
    """Safely map a DB waste_reports row to the WasteReportResponse schema shape."""
    return {
        "id": str(row.get("id", "")),
        "reporter_id": str(row.get("reporter_id", "") or ""),
        "state": row.get("status", "SUBMITTED"),
        "category": "PLASTIC",
        "estimated_weight_kg": float(row.get("estimated_weight_kg") or 0.0),
        "location": {"address": "Saved Location", "coordinates": [0, 0]},
        "description": row.get("description", ""),
        "image_url": None,
        "admin_notes": row.get("admin_notes"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


class WasteReportService:
    """Abstracts database operations for Waste Reports using the Supabase SDK."""

    @staticmethod
    def create_report(user_id: str, data: WasteReportCreate) -> dict:
        """Create a new waste report."""
        now = datetime.utcnow().isoformat()

        cat_map = {"TEXTILE": 1, "PLASTIC": 2, "E-WASTE": 3, "PAPER": 4, "GLASS": 5, "METAL": 6, "MIXED": 1}
        cat_id = cat_map.get(str(data.category).upper(), 1) if data.category else 1

        coords = None
        if data.location and hasattr(data.location, "coordinates") and data.location.coordinates:
            coords = data.location.coordinates

        insert_data = {
            "reporter_id": user_id,
            "location": f"POINT({coords[0]} {coords[1]})" if coords else "POINT(0 0)",
            "description": data.description,
            "category_id": cat_id,
            "estimated_weight_kg": data.estimated_weight_kg,
            "severity": "MEDIUM",
            "status": WasteReportState.SUBMITTED.value,
            "created_at": now,
            "updated_at": now,
        }

        try:
            response = supabase.table("waste_reports").insert(insert_data).execute()
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create waste report in database")
            return _map_report_row(response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB error creating report: {str(e)}")

    @staticmethod
    def get_report_by_id(report_id: str) -> Optional[dict]:
        """Fetch a specific report."""
        response = supabase.table("waste_reports").select("*").eq("id", report_id).execute()
        if not response.data:
            return None
        return _map_report_row(response.data[0])

    @staticmethod
    def get_reports_for_user(user: UserResponse, skip: int = 0, limit: int = 50) -> List[dict]:
        """Admins see all reports. Consumers see only their own."""
        query = supabase.table("waste_reports").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)

        if user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.ANALYST]:
            query = query.eq("reporter_id", user.id)

        response = query.execute()
        return [_map_report_row(r) for r in response.data]

    @staticmethod
    def update_report_state(report_id: str, new_state: WasteReportState, admin_notes: Optional[str] = None) -> dict:
        """Update the state of a report (Admin only)."""
        check = supabase.table("waste_reports").select("id").eq("id", report_id).execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Report not found")

        update_data = {
            "status": new_state.value,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if admin_notes is not None:
            update_data["admin_notes"] = admin_notes

        response = supabase.table("waste_reports").update(update_data).eq("id", report_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update report state")
        return _map_report_row(response.data[0])
