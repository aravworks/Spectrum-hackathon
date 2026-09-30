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


def _map_listing_row(row: dict) -> dict:
    """Safely map a DB marketplace_listings row to the Response schema shape."""
    return {
        "id": str(row.get("id", "")),
        "seller_id": str(row.get("seller_id", "") or ""),
        "category_id": int(row.get("category_id") or 1),
        "quantity_kg": float(row.get("quantity_kg") or 0.0),
        "asking_price": float(row.get("asking_price") or 0.0),
        "location": {"address": "Saved Location", "coordinates": [0, 0]},
        "status": row.get("status", "AVAILABLE"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


class MarketplaceService:

    @staticmethod
    def create_listing(seller_id: str, data: MarketplaceListingCreate) -> dict:
        now = datetime.utcnow().isoformat()

        coords = None
        if hasattr(data, "location") and data.location and hasattr(data.location, "coordinates") and data.location.coordinates:
            coords = data.location.coordinates

        insert_data = {
            "seller_id": seller_id,
            "category_id": getattr(data, "category_id", 1) or 1,
            "quantity_kg": getattr(data, "quantity_kg", 0) or 0,
            "asking_price": getattr(data, "asking_price", 0) or 0,
            "location": f"POINT({coords[0]} {coords[1]})" if coords else "POINT(0 0)",
            "status": ListingStatus.AVAILABLE.value,
            "created_at": now,
            "updated_at": now,
        }

        try:
            response = supabase.table("marketplace_listings").insert(insert_data).execute()
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create listing")
            return _map_listing_row(response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB error creating listing: {str(e)}")

    @staticmethod
    def get_listings(status: Optional[ListingStatus] = None, skip: int = 0, limit: int = 50) -> List[dict]:
        query = supabase.table("marketplace_listings").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        if status:
            query = query.eq("status", status.value if hasattr(status, "value") else status)
        response = query.execute()
        return [_map_listing_row(r) for r in response.data]

    @staticmethod
    def get_listing_by_id(listing_id: str) -> Optional[dict]:
        response = supabase.table("marketplace_listings").select("*").eq("id", listing_id).execute()
        if not response.data:
            return None
        return _map_listing_row(response.data[0])

    @staticmethod
    def create_offer(listing_id: str, buyer_id: str, data: MarketplaceOfferCreate) -> MarketplaceOfferResponse:
        now = datetime.utcnow().isoformat()

        listing_res = supabase.table("marketplace_listings").select("id").eq("id", listing_id).execute()
        if not listing_res.data:
            raise HTTPException(status_code=404, detail="Listing not found")

        insert_data = {
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "offered_price": data.offered_price,
            "status": OfferStatus.PENDING.value,
            "created_at": now,
            "updated_at": now,
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

        supabase.table("marketplace_offers").update({"status": OfferStatus.ACCEPTED.value}).eq("id", offer_id).execute()
        supabase.table("marketplace_listings").update({"status": ListingStatus.SOLD.value}).eq("id", listing["id"]).execute()

        offer["status"] = OfferStatus.ACCEPTED.value
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
                {"actor": listing.get("seller_id", "unknown"), "action": "Collected", "date": listing["created_at"]}
            ],
            environmental_impact={"co2_saved_kg": listing["quantity_kg"] * 1.5},
            generated_at=datetime.utcnow(),
        )
