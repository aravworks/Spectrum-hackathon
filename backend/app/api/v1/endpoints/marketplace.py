from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.marketplace import (
    MarketplaceListingCreate, MarketplaceListingResponse, ListingStatus,
    MarketplaceOfferCreate, MarketplaceOfferResponse, TraceabilityManifestResponse
)
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.marketplace_service import MarketplaceService

router = APIRouter()

# --- Listings ---
@router.post("/listings", status_code=201)
def create_listing(
    *,
    listing_in: MarketplaceListingCreate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.COLLECTOR, UserRole.RECYCLER, UserRole.CITY_ADMIN, UserRole.CONSUMER]))
) -> Any:
    """
    Create a new B2B marketplace listing (e.g., selling 500kg of sorted PET plastic).
    Restricted to Collectors, Recyclers, and Admins.
    """
    return MarketplaceService.create_listing(seller_id=current_user.id, data=listing_in)

@router.get("/listings")
def get_listings(
    status: Optional[ListingStatus] = ListingStatus.AVAILABLE,
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Browse the marketplace. Any active user can browse available listings.
    """
    return MarketplaceService.get_listings(status=status, skip=skip, limit=limit)

@router.get("/listings/{listing_id}")
def get_listing(
    listing_id: str,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """Fetch details of a specific marketplace listing."""
    listing = MarketplaceService.get_listing_by_id(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

# --- Offers ---
@router.post("/listings/{listing_id}/offers", status_code=201)
def place_offer(
    *,
    listing_id: str,
    offer_in: MarketplaceOfferCreate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.RECYCLER, UserRole.CONSUMER, UserRole.CITY_ADMIN]))
) -> Any:
    """
    Place a financial bid/offer on an available listing.
    """
    return MarketplaceService.create_offer(buyer_id=current_user.id, listing_id=listing_id, data=offer_in)

@router.patch("/offers/{offer_id}/accept", response_model=MarketplaceOfferResponse)
def accept_offer(
    *,
    offer_id: str,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Accept an offer. The user must be the original seller of the listing.
    This marks the listing as SOLD and rejects all competing offers automatically.
    """
    return MarketplaceService.accept_offer(seller_id=current_user.id, offer_id=offer_id)

# --- Manifests ---
@router.get("/manifests/{listing_id}", response_model=TraceabilityManifestResponse)
def get_traceability_manifest(
    listing_id: str,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve the Digital Product Passport / Traceability Manifest for a SOLD listing.
    Provides the chain of custody and environmental impact statement.
    Powers the ProductPassportPage on the frontend.
    """
    return MarketplaceService.generate_manifest(listing_id)
