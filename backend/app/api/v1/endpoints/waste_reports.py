from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.waste_report import (
    WasteReportCreate, 
    WasteReportResponse, 
    WasteReportStateUpdate
)
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.waste_report_service import WasteReportService

router = APIRouter()

@router.post("/", response_model=WasteReportResponse, status_code=201)
def create_report(
    *,
    # db: Session = Depends(deps.get_db), # Teammate to uncomment
    report_in: WasteReportCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Submit a new waste report.
    Any active user can submit a report.
    """
    report = WasteReportService.create_report(user_id=current_user.id, data=report_in)
    return report

@router.get("/", response_model=List[WasteReportResponse])
def get_reports(
    skip: int = 0,
    limit: int = 50,
    # db: Session = Depends(deps.get_db), # Teammate to uncomment
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve waste reports.
    - Consumers only see their own reports.
    - City Admins and Sys Admins see all reports.
    """
    reports = WasteReportService.get_reports_for_user(user=current_user, skip=skip, limit=limit)
    return reports

@router.get("/{report_id}", response_model=WasteReportResponse)
def get_report(
    report_id: str,
    # db: Session = Depends(deps.get_db), # Teammate to uncomment
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get a specific waste report by ID.
    """
    report = WasteReportService.get_report_by_id(report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Waste report not found")
        
    # Check permissions (only Admins or the Reporter can view)
    if (current_user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.ANALYST]) and (report.reporter_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions to view this report")
        
    return report

@router.patch("/{report_id}/state", response_model=WasteReportResponse)
def update_report_state(
    *,
    report_id: str,
    state_in: WasteReportStateUpdate,
    # db: Session = Depends(deps.get_db), # Teammate to uncomment
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Update the state of a waste report.
    Restricted to CITY_ADMIN and SYS_ADMIN.
    Transitions: SUBMITTED -> VERIFIED, REJECTED, DUPLICATE, etc.
    """
    report = WasteReportService.get_report_by_id(report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Waste report not found")
        
    updated_report = WasteReportService.update_report_state(
        report_id=report_id, 
        new_state=state_in.state,
        admin_notes=state_in.admin_notes
    )
    return updated_report
