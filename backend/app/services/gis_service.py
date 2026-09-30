from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.gis import (
    GeoJSONFeatureCollection,
    GeoJSONFeature,
    GeoJSONGeometry,
    ReviewStatus,
    CandidateReviewUpdate,
    DumpCandidateResponse
)

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace with SQLAlchemy PostGIS queries.
# Example PostGIS query: 
# db.query(Hotspot.id, ST_AsGeoJSON(Hotspot.geometry).label('geom'), Hotspot.score)...

MOCK_HOTSPOTS = [
    {
        "id": 1,
        "city_id": 1,
        "geometry": {"type": "Point", "coordinates": [72.8777, 19.0760]}, # Mumbai
        "score": 85.5,
        "evidence_count": 12,
        "confidence": 0.92,
        "status": "ACTIVE",
        "generated_at": datetime.utcnow()
    },
    {
        "id": 2,
        "city_id": 1,
        "geometry": {"type": "Point", "coordinates": [72.8347, 19.0596]}, # Parel
        "score": 65.0,
        "evidence_count": 5,
        "confidence": 0.78,
        "status": "ACTIVE",
        "generated_at": datetime.utcnow()
    }
]

MOCK_CANDIDATES = [
    {
        "id": 101,
        "observation_id": 5001,
        "geometry": {"type": "Point", "coordinates": [72.8656, 19.0896]}, # Bandra Outskirts
        "confidence": 0.88,
        "classifier_version": "v2.1.0-resnet",
        "human_review_status": ReviewStatus.PENDING,
        "reviewed_by": None,
        "reviewed_at": None
    },
    {
        "id": 102,
        "observation_id": 5002,
        "geometry": {"type": "Point", "coordinates": [72.8999, 19.0999]},
        "confidence": 0.95,
        "classifier_version": "v2.1.0-resnet",
        "human_review_status": ReviewStatus.PENDING,
        "reviewed_by": None,
        "reviewed_at": None
    }
]

class GISService:

    @staticmethod
    def get_hotspots_geojson(city_id: Optional[int] = None) -> GeoJSONFeatureCollection:
        """Converts hotspot database records into a standard GeoJSON FeatureCollection."""
        features = []
        
        # Filter by city if provided
        records = MOCK_HOTSPOTS
        if city_id:
            records = [r for r in records if r["city_id"] == city_id]

        for record in records:
            feature = GeoJSONFeature(
                type="Feature",
                geometry=GeoJSONGeometry(**record["geometry"]),
                properties={
                    "id": record["id"],
                    "score": record["score"],
                    "evidence_count": record["evidence_count"],
                    "confidence": record["confidence"],
                    "status": record["status"],
                    "type": "hotspot"
                }
            )
            features.append(feature)
            
        return GeoJSONFeatureCollection(type="FeatureCollection", features=features)

    @staticmethod
    def get_candidates_geojson(status: Optional[ReviewStatus] = None) -> GeoJSONFeatureCollection:
        """Converts AI dump candidates into GeoJSON for map rendering."""
        features = []
        
        records = MOCK_CANDIDATES
        if status:
            records = [r for r in records if r["human_review_status"] == status]

        for record in records:
            feature = GeoJSONFeature(
                type="Feature",
                geometry=GeoJSONGeometry(**record["geometry"]),
                properties={
                    "id": record["id"],
                    "confidence": record["confidence"],
                    "human_review_status": record["human_review_status"],
                    "type": "satellite_candidate"
                }
            )
            features.append(feature)
            
        return GeoJSONFeatureCollection(type="FeatureCollection", features=features)

    @staticmethod
    def review_candidate(candidate_id: int, admin_id: str, update: CandidateReviewUpdate) -> DumpCandidateResponse:
        """Records a human-in-the-loop verification of a satellite detection."""
        candidate = next((c for c in MOCK_CANDIDATES if c["id"] == candidate_id), None)
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        candidate["human_review_status"] = update.status
        candidate["reviewed_by"] = admin_id
        candidate["reviewed_at"] = datetime.utcnow()
        
        return DumpCandidateResponse(**candidate)
