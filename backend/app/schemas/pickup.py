from typing import Optional, List
from datetime import datetime, time
from pydantic import BaseModel, Field
from enum import Enum

from app.schemas.waste_report import Location, WasteCategory

class PickupState(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class TimeWindowBase(BaseModel):
    start_time: time
    end_time: time

class PickupCreate(BaseModel):
    location: Location
    estimated_weight_kg: float = Field(..., gt=0)
    category: WasteCategory = WasteCategory.MIXED
    preferred_window: Optional[TimeWindowBase] = None
    notes: Optional[str] = None

class PickupResponse(PickupCreate):
    id: str
    user_id: str
    state: PickupState
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
