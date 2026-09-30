"""
Route optimization engine for waste collection.

Three-phase approach:
    Phase 1: Nearest-neighbor baseline + 2-opt local search
    Phase 2: OR-Tools VRP solver with capacity & time-window constraints
    Phase 3: ML-enhanced demand prediction for proactive routing (future)

Usage:
    from ml.routing import RouteOptimizer, RoutingRequest, VehicleProfile

    request = RoutingRequest(
        depot=Location(lat=19.076, lng=72.877),
        jobs=[...],
        vehicles=[VehicleProfile(id="v1", capacity_kg=500)],
    )
    optimizer = RouteOptimizer(distance_provider=provider)
    result = optimizer.optimize(request)
"""

from ml.routing.models import (
    Location,
    Job,
    VehicleProfile,
    TimeWindow,
    RoutingRequest,
    OptimizedRoute,
    RoutingResult,
)
from ml.routing.optimizer import RouteOptimizer

__all__ = [
    "Location",
    "Job",
    "VehicleProfile",
    "TimeWindow",
    "RoutingRequest",
    "OptimizedRoute",
    "RoutingResult",
    "RouteOptimizer",
]
