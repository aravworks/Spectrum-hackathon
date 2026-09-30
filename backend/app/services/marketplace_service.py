from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.marketplace import ListingCreate, ListingResponse, ListingStatus, OfferCreate, OfferResponse, OfferStatus
from app.schemas.user import UserResponse
from app.core.db import supabase

class MarketplaceService:

    @staticmethod
    def create_listing(seller_id: str, data: ListingCreate) -> ListingResponse:
        now = datetime.utcnow().isoformat()
        insert_data = {
            "seller_id": seller_id,
            "title": data.title,
            "description": data.description,
            "category": data.category,
            "weight_kg": data.weight_kg,
            "purity_percentage": data.purity_percentage,
            "asking_price_per_kg": data.asking_price_per_kg,
            "location": data.location.model_dump(),
            "status": ListingStatus.ACTIVE,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("marketplace_listings").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create listing")
            
        return ListingResponse(**response.data[0])

    @staticmethod
    def get_listings(
        status: Optional[ListingStatus] = None, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[ListingResponse]:
        query = supabase.table("marketplace_listings").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        if status:
            query = query.eq("status", status)
            
        response = query.execute()
        return [ListingResponse(**l) for l in response.data]

    @staticmethod
    def get_listing_by_id(listing_id: str) -> Optional[ListingResponse]:
        response = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not response.data:
            return None
        return ListingResponse(**response.data[0])

    @staticmethod
    def create_offer(listing_id: str, buyer_id: str, data: OfferCreate) -> OfferResponse:
        now = datetime.utcnow().isoformat()
        
        # Verify listing exists
        listing_res = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not listing_res.data:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        insert_data = {
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "offered_price_per_kg": data.offered_price_per_kg,
            "message": data.message,
            "status": OfferStatus.PENDING,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("marketplace_offers").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create offer")
            
        return OfferResponse(**response.data[0])

    @staticmethod
    def get_offers_for_listing(listing_id: str) -> List[OfferResponse]:
        response = supabase.table("marketplace_offers").select("*").eq("listing_id", listing_id).order("created_at", desc=True).execute()
        return [OfferResponse(**o) for o in response.data]

    @staticmethod
    def update_offer_status(offer_id: str, status: OfferStatus, seller: UserResponse) -> OfferResponse:
        offer_res = supabase.table("marketplace_offers").select("*").eq("id", offer_id).execute()
        if not offer_res.data:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        # Optional: Security check that the current user is the seller of the listing
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("marketplace_offers").update(update_data).eq("id", offer_id).execute()
        return OfferResponse(**response.data[0])
