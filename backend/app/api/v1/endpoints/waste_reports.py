from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.schemas.waste_report import WasteReportCreate, WasteReportStateUpdate
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.waste_report_service import WasteReportService

router = APIRouter()


@router.post("/", status_code=201)
def create_report(
    *,
    report_in: WasteReportCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """Submit a new waste report. Any active user can submit."""
    try:
        report = WasteReportService.create_report(user_id=current_user.id, data=report_in)
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create report: {str(e)}")


@router.get("/")
def get_reports(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """Consumers see their own reports. Admins see all."""
    try:
        reports = WasteReportService.get_reports_for_user(user=current_user, skip=skip, limit=limit)
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")


@router.get("/{report_id}")
def get_report(
    report_id: str,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """Get a specific waste report by ID."""
    report = WasteReportService.get_report_by_id(report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Waste report not found")
    return report


@router.patch("/{report_id}/state")
def update_report_state(
    *,
    report_id: str,
    state_in: WasteReportStateUpdate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN])),
) -> Any:
    """Update the state of a waste report. Restricted to CITY_ADMIN and SYS_ADMIN."""
    report = WasteReportService.get_report_by_id(report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Waste report not found")
    updated = WasteReportService.update_report_state(
        report_id=report_id,
        new_state=state_in.state,
        admin_notes=state_in.admin_notes,
    )
    return updated
