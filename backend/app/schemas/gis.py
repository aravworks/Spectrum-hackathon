from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class ReviewStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"

# --- Standard GeoJSON Schemas ---
class GeoJSONGeometry(BaseModel):
    type: str  # "Point", "Polygon", etc.
    coordinates: Any  # e.g., [longitude, latitude]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

# --- API Specific Payloads ---
class CandidateReviewUpdate(BaseModel):
    status: ReviewStatus
    notes: Optional[str] = None

class DumpCandidateResponse(BaseModel):
    id: int
    observation_id: int
    confidence: float
    classifier_version: str
    human_review_status: ReviewStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
