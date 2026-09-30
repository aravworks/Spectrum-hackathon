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

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace this mock database with real SQLAlchemy queries
# using the models you are building. The interface should stay roughly the same.

MOCK_REPORTS = {}

class WasteReportService:
    """
    Abstracts database operations for Waste Reports.
    Currently uses an in-memory dictionary.
    """

    @staticmethod
    def create_report(user_id: str, data: WasteReportCreate) -> WasteReportResponse:
        """Create a new waste report."""
        report_id = f"wr-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        report_dict = {
            "id": report_id,
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
        
        MOCK_REPORTS[report_id] = report_dict
        # TODO: db.add(new_report); db.commit(); db.refresh(new_report)
        return WasteReportResponse(**report_dict)

    @staticmethod
    def get_report_by_id(report_id: str) -> Optional[WasteReportResponse]:
        """Fetch a specific report."""
        # TODO: return db.query(WasteReport).filter(WasteReport.id == report_id).first()
        report = MOCK_REPORTS.get(report_id)
        if report:
            return WasteReportResponse(**report)
        return None

    @staticmethod
    def get_reports_for_user(user: UserResponse, skip: int = 0, limit: int = 50) -> List[WasteReportResponse]:
        """
        Admins see all reports. Consumers see only their own.
        """
        # TODO: Query with SQLAlchemy
        # if user.role in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]:
        #     return db.query(WasteReport).offset(skip).limit(limit).all()
        # else:
        #     return db.query(WasteReport).filter(WasteReport.reporter_id == user.id).offset(skip).limit(limit).all()
        
        all_reports = list(MOCK_REPORTS.values())
        
        if user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.ANALYST]:
            all_reports = [r for r in all_reports if r["reporter_id"] == user.id]
            
        # Sort by newest first
        all_reports.sort(key=lambda x: x["created_at"], reverse=True)
        
        paginated = all_reports[skip : skip + limit]
        return [WasteReportResponse(**r) for r in paginated]

    @staticmethod
    def update_report_state(report_id: str, new_state: WasteReportState, admin_notes: Optional[str] = None) -> WasteReportResponse:
        """Update the state of a report (Admin only)."""
        report = MOCK_REPORTS.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # In a real app, we would enforce state machine rules here
        # e.g., Cannot go from SUBMITTED directly to COLLECTED
        
        report["state"] = new_state
        report["updated_at"] = datetime.utcnow()
        if admin_notes:
            report["admin_notes"] = admin_notes
            
        # TODO: db.commit()
        return WasteReportResponse(**report)
