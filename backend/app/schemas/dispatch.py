from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class RouteStopResponse(BaseModel):
    sequence: int
    pickup_id: str
    estimated_arrival_minutes: int
    cumulative_load_kg: float
    distance_from_previous_m: float

class OptimizedRouteResponse(BaseModel):
    route_id: str
    vehicle_id: str
    collector_id: str
    total_distance_m: float
    total_load_kg: float
    estimated_duration_minutes: float
    stops: List[RouteStopResponse]

class DispatchRunResponse(BaseModel):
    optimization_version: str
    computation_time_seconds: float
    strategy_used: str
    num_routes_created: int
    num_jobs_assigned: int
    num_jobs_unassigned: int
    routes: List[OptimizedRouteResponse]
    unassigned_pickup_ids: List[str]
    created_at: datetime = datetime.utcnow()
