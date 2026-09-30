from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class WasteReportState(str, Enum):
    """State machine for waste reports based on workflow.md"""
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    DUPLICATE = "DUPLICATE"
    ASSIGNED = "ASSIGNED"
    SCHEDULED = "SCHEDULED"
    COLLECTED = "COLLECTED"
    VERIFIED_RESOLUTION = "VERIFIED_RESOLUTION"
    CLOSED = "CLOSED"

class WasteCategory(str, Enum):
    PLASTIC = "PLASTIC"
    ORGANIC = "ORGANIC"
    HAZARDOUS = "HAZARDOUS"
    E_WASTE = "E_WASTE"
    MIXED = "MIXED"
    CONSTRUCTION = "CONSTRUCTION"

class Location(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class WasteReportBase(BaseModel):
    location: Location
    description: Optional[str] = None
    category: WasteCategory = WasteCategory.MIXED
    image_url: Optional[str] = None
    estimated_weight_kg: Optional[float] = Field(None, ge=0)

class WasteReportCreate(WasteReportBase):
    """Payload for submitting a new report"""
    pass

class WasteReportStateUpdate(BaseModel):
    """Payload for admins updating the state of a report"""
    state: WasteReportState
    admin_notes: Optional[str] = None

class WasteReportResponse(WasteReportBase):
    """Standard response model for a waste report"""
    id: str
    reporter_id: str
    state: WasteReportState
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
