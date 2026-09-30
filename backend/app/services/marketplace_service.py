import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.marketplace import (
    MarketplaceListingCreate, MarketplaceListingResponse, ListingStatus,
    MarketplaceOfferCreate, MarketplaceOfferResponse, OfferStatus,
    TraceabilityManifestResponse
)

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace with SQLAlchemy queries for marketplace_listings and marketplace_offers tables.

MOCK_LISTINGS = {}
MOCK_OFFERS = {}

class MarketplaceService:
    
    @staticmethod
    def create_listing(seller_id: str, data: MarketplaceListingCreate) -> MarketplaceListingResponse:
        listing_id = f"list-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        listing_dict = {
            "id": listing_id,
            "seller_id": seller_id,
            "category_id": data.category_id,
            "quantity_kg": data.quantity_kg,
            "asking_price": data.asking_price,
            "location": data.location.model_dump(),
            "status": ListingStatus.AVAILABLE,
            "expires_at": now + timedelta(days=30),
            "created_at": now,
            "updated_at": now
        }
        
        MOCK_LISTINGS[listing_id] = listing_dict
        return MarketplaceListingResponse(**listing_dict)

    @staticmethod
    def get_listings(status: Optional[ListingStatus] = ListingStatus.AVAILABLE, skip: int = 0, limit: int = 50) -> List[MarketplaceListingResponse]:
        listings = list(MOCK_LISTINGS.values())
        if status:
            listings = [l for l in listings if l["status"] == status]
            
        listings.sort(key=lambda x: x["created_at"], reverse=True)
        return [MarketplaceListingResponse(**l) for l in listings[skip : skip + limit]]

    @staticmethod
    def get_listing_by_id(listing_id: str) -> Optional[MarketplaceListingResponse]:
        listing = MOCK_LISTINGS.get(listing_id)
        if listing:
            return MarketplaceListingResponse(**listing)
        return None

    @staticmethod
    def create_offer(buyer_id: str, listing_id: str, data: MarketplaceOfferCreate) -> MarketplaceOfferResponse:
        listing = MOCK_LISTINGS.get(listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        if listing["status"] != ListingStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Listing is no longer available")
        if listing["seller_id"] == buyer_id:
            raise HTTPException(status_code=400, detail="Cannot place an offer on your own listing")
            
        offer_id = f"off-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        offer_dict = {
            "id": offer_id,
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "offered_price": data.offered_price,
            "status": OfferStatus.PENDING,
            "created_at": now,
            "updated_at": now
        }
        
        MOCK_OFFERS[offer_id] = offer_dict
        return MarketplaceOfferResponse(**offer_dict)

    @staticmethod
    def accept_offer(seller_id: str, offer_id: str) -> MarketplaceOfferResponse:
        offer = MOCK_OFFERS.get(offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        listing = MOCK_LISTINGS.get(offer["listing_id"])
        if listing["seller_id"] != seller_id:
            raise HTTPException(status_code=403, detail="Not authorized to accept offers for this listing")
            
        # Update Offer
        offer["status"] = OfferStatus.ACCEPTED
        offer["updated_at"] = datetime.utcnow()
        
        # Reject all other offers for this listing
        for o in MOCK_OFFERS.values():
            if o["listing_id"] == listing["id"] and o["id"] != offer_id:
                o["status"] = OfferStatus.REJECTED
                o["updated_at"] = datetime.utcnow()
                
        # Update Listing
        listing["status"] = ListingStatus.SOLD
        listing["updated_at"] = datetime.utcnow()
        
        return MarketplaceOfferResponse(**offer)

    @staticmethod
    def generate_manifest(listing_id: str) -> TraceabilityManifestResponse:
        """
        Generates a digital passport / manifest tracing the lifecycle of the waste.
        """
        listing = MOCK_LISTINGS.get(listing_id)
        if not listing or listing["status"] != ListingStatus.SOLD:
            raise HTTPException(status_code=400, detail="Manifests are only available for sold listings")
            
        accepted_offer = next((o for o in MOCK_OFFERS.values() if o["listing_id"] == listing_id and o["status"] == OfferStatus.ACCEPTED), None)
        
        # Build digital chain of custody
        chain = [
            {
                "step": 1,
                "action": "WASTE_COLLECTED_AND_SORTED",
                "actor_id": listing["seller_id"],
                "timestamp": listing["created_at"].isoformat(),
                "location": listing["location"]
            },
            {
                "step": 2,
                "action": "WASTE_PURCHASED_FOR_RECYCLING",
                "actor_id": accepted_offer["buyer_id"] if accepted_offer else "UNKNOWN",
                "timestamp": listing["updated_at"].isoformat(),
                "price_paid": accepted_offer["offered_price"] if accepted_offer else 0.0
            }
        ]
        
        # Mock footprint impact (normally fetched from FootprintService)
        # Assuming category dictates a standard savings metric
        impact = {
            "co2e_kg_saved": listing["quantity_kg"] * 1.5,
            "methane_kg_saved": listing["quantity_kg"] * 0.05
        }
        
        return TraceabilityManifestResponse(
            manifest_id=f"mnf-{listing_id}",
            listing_id=listing_id,
            waste_category_id=listing["category_id"],
            total_quantity_kg=listing["quantity_kg"],
            chain_of_custody=chain,
            environmental_impact=impact,
            generated_at=datetime.utcnow()
        )
