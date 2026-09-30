from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.schemas.waste_report import Location

class ListingStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    PENDING = "PENDING"
    SOLD = "SOLD"
    CANCELLED = "CANCELLED"

class OfferStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

# --- Listings ---
class MarketplaceListingCreate(BaseModel):
    category_id: int
    quantity_kg: float = Field(..., gt=0)
    asking_price: float = Field(..., ge=0)
    location: Location

class MarketplaceListingResponse(MarketplaceListingCreate):
    id: str
    seller_id: str
    status: ListingStatus
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Offers ---
class MarketplaceOfferCreate(BaseModel):
    offered_price: float = Field(..., gt=0)

class MarketplaceOfferResponse(MarketplaceOfferCreate):
    id: str
    listing_id: str
    buyer_id: str
    status: OfferStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Traceability / Manifests ---
class TraceabilityManifestResponse(BaseModel):
    manifest_id: str
    listing_id: str
    waste_category_id: int
    total_quantity_kg: float
    chain_of_custody: List[Dict[str, Any]]
    environmental_impact: Dict[str, float]
    generated_at: datetime
