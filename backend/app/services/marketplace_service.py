import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.marketplace import (
    MarketplaceListingCreate, MarketplaceListingResponse, ListingStatus,
    MarketplaceOfferCreate, MarketplaceOfferResponse, OfferStatus,
    TraceabilityManifestResponse
)
from app.core.db import supabase

class MarketplaceService:

    @staticmethod
    def create_listing(seller_id: str, data: MarketplaceListingCreate) -> MarketplaceListingResponse:
        now = datetime.utcnow().isoformat()
        insert_data = {
            "seller_id": seller_id,
            "category_id": data.category_id,
            "quantity_kg": data.quantity_kg,
            "asking_price": data.asking_price,
            "location": data.location.model_dump(),
            "status": ListingStatus.AVAILABLE,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("marketplace_listings").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create listing")
            
        return MarketplaceListingResponse(**response.data[0])

    @staticmethod
    def get_listings(
        status: Optional[ListingStatus] = None, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[MarketplaceListingResponse]:
        query = supabase.table("marketplace_listings").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        if status:
            query = query.eq("status", status)
            
        response = query.execute()
        return [MarketplaceListingResponse(**l) for l in response.data]

    @staticmethod
    def get_listing_by_id(listing_id: str) -> Optional[MarketplaceListingResponse]:
        response = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not response.data:
            return None
        return MarketplaceListingResponse(**response.data[0])

    @staticmethod
    def create_offer(listing_id: str, buyer_id: str, data: MarketplaceOfferCreate) -> MarketplaceOfferResponse:
        now = datetime.utcnow().isoformat()
        
        # Verify listing exists
        listing_res = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not listing_res.data:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        insert_data = {
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "offered_price": data.offered_price,
            "status": OfferStatus.PENDING,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("marketplace_offers").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create offer")
            
        return MarketplaceOfferResponse(**response.data[0])

    @staticmethod
    def accept_offer(seller_id: str, offer_id: str) -> MarketplaceOfferResponse:
        offer_res = supabase.table("marketplace_offers").select("*").eq("id", offer_id).execute()
        if not offer_res.data:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        offer = offer_res.data[0]
        
        listing_res = supabase.table("marketplace_listings").select("*").eq("id", offer["listing_id"]).execute()
        if not listing_res.data:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        listing = listing_res.data[0]
        if listing["seller_id"] != seller_id:
            raise HTTPException(status_code=403, detail="Only the seller can accept offers.")
            
        # Update offer to ACCEPTED
        supabase.table("marketplace_offers").update({"status": OfferStatus.ACCEPTED}).eq("id", offer_id).execute()
        
        # Update listing to SOLD
        supabase.table("marketplace_listings").update({"status": ListingStatus.SOLD}).eq("id", listing["id"]).execute()
        
        offer["status"] = OfferStatus.ACCEPTED
        return MarketplaceOfferResponse(**offer)

    @staticmethod
    def generate_manifest(listing_id: str) -> TraceabilityManifestResponse:
        listing_res = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not listing_res.data:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        listing = listing_res.data[0]
        
        return TraceabilityManifestResponse(
            manifest_id=f"MNF-{uuid.uuid4().hex[:8].upper()}",
            listing_id=listing_id,
            waste_category_id=listing["category_id"],
            total_quantity_kg=listing["quantity_kg"],
            chain_of_custody=[
                {"actor": listing["seller_id"], "action": "Collected", "date": listing["created_at"]}
            ],
            environmental_impact={"co2_saved_kg": listing["quantity_kg"] * 1.5},
            generated_at=datetime.utcnow()
        )
