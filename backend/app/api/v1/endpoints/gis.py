from typing import Any, Optional
from fastapi import APIRouter, Depends

from app.schemas.gis import (
    GeoJSONFeatureCollection,
    CandidateReviewUpdate,
    DumpCandidateResponse,
    ReviewStatus
)
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.gis_service import GISService

router = APIRouter()

@router.get("/hotspots", response_model=GeoJSONFeatureCollection)
def get_hotspots(
    city_id: Optional[int] = None,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Returns a GeoJSON FeatureCollection of calculated waste hotspots.
    Consumed natively by mapping libraries (Leaflet/Mapbox).
    """
    return GISService.get_hotspots_geojson(city_id=city_id)

@router.get("/candidates", response_model=GeoJSONFeatureCollection)
def get_satellite_candidates(
    status: Optional[ReviewStatus] = ReviewStatus.PENDING,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN, UserRole.RESEARCHER, UserRole.ANALYST]))
) -> Any:
    """
    Returns GeoJSON of unverified satellite-detected dump sites.
    Restricted to Admins and Researchers.
    """
    return GISService.get_candidates_geojson(status=status)

@router.patch("/candidates/{candidate_id}/review", response_model=DumpCandidateResponse)
def review_satellite_candidate(
    *,
    candidate_id: int,
    update_in: CandidateReviewUpdate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Human-in-the-loop verification. 
    Admins can CONFIRM or REJECT a satellite detection.
    """
    return GISService.review_candidate(
        candidate_id=candidate_id, 
        admin_id=current_user.id, 
        update=update_in
    )
