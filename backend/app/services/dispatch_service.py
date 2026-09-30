import os
import sys
from typing import List, Tuple

from ml.routing.models import (
    Location as MLLocation, 
    Job as MLJob, 
    VehicleProfile as MLVehicle, 
    JobSource, 
    RoutingRequest,
    TimeWindow as MLTimeWindow
)
from ml.routing.optimizer import RouteOptimizer
from ml.routing.distance import HaversineDistanceProvider

from app.schemas.dispatch import DispatchRunResponse, OptimizedRouteResponse, RouteStopResponse
from app.services.pickup_service import PickupService

# -------------------------------------------------------------------
# MOCK VEHICLES
# -------------------------------------------------------------------
# TODO (Teammate): Fetch active vehicles/collectors from the database
MOCK_VEHICLES = [
    MLVehicle(id="veh-1", collector_id="col-101", capacity_kg=500.0, max_jobs=20),
    MLVehicle(id="veh-2", collector_id="col-102", capacity_kg=300.0, max_jobs=15),
]

# Standard Depot Location (e.g., Central Waste Facility)
DEPOT_LOCATION = MLLocation(lat=19.0760, lng=72.8777)

class DispatchService:
    
    @staticmethod
    def run_optimization() -> DispatchRunResponse:
        """
        1. Fetch all pending pickups.
        2. Format them into ML Engine `Job` models.
        3. Fetch available vehicles.
        4. Run the ML RouteOptimizer.
        5. Save routes and update pickup states.
        6. Return the API response format.
        """
        
        # 1. Fetch pending requests
        pending_pickups = PickupService.get_unassigned_pickups()
        
        if not pending_pickups:
            return DispatchRunResponse(
                optimization_version="1.0",
                computation_time_seconds=0.0,
                strategy_used="NONE",
                num_routes_created=0,
                num_jobs_assigned=0,
                num_jobs_unassigned=0,
                routes=[],
                unassigned_pickup_ids=[]
            )
            
        # 2. Format into ML Job models
        ml_jobs = []
        for p in pending_pickups:
            tw = None
            if p.preferred_window:
                tw = MLTimeWindow(start=p.preferred_window.start_time, end=p.preferred_window.end_time)
                
            job = MLJob(
                id=p.id,
                location=MLLocation(lat=p.location.lat, lng=p.location.lng),
                source=JobSource.PICKUP_REQUEST,
                source_id=p.id,
                estimated_weight_kg=p.estimated_weight_kg,
                time_window=tw
            )
            ml_jobs.append(job)
            
        # 3. Create Routing Request
        request = RoutingRequest(
            depot=DEPOT_LOCATION,
            jobs=ml_jobs,
            vehicles=MOCK_VEHICLES
        )
        
        # 4. Run Optimizer (using Haversine for now so it doesn't need API keys)
        optimizer = RouteOptimizer(distance_provider=HaversineDistanceProvider())
        result = optimizer.optimize(request)
        
        # 5. Format results to API Schema
        api_routes = []
        assigned_pickup_ids = []
        
        for r in result.routes:
            stops = []
            for s in r.stops:
                assigned_pickup_ids.append(s.job.source_id)
                stops.append(RouteStopResponse(
                    sequence=s.sequence,
                    pickup_id=s.job.source_id,
                    estimated_arrival_minutes=s.arrival_time_offset_minutes,
                    cumulative_load_kg=s.cumulative_load_kg,
                    distance_from_previous_m=s.distance_from_previous_m
                ))
                
            api_routes.append(OptimizedRouteResponse(
                route_id=r.id,
                vehicle_id=r.vehicle.id,
                collector_id=r.vehicle.collector_id,
                total_distance_m=r.total_distance_m,
                total_load_kg=r.total_load_kg,
                estimated_duration_minutes=r.estimated_duration_minutes,
                stops=stops
            ))
            
        # Update state in DB to ASSIGNED
        PickupService.mark_pickups_assigned(assigned_pickup_ids)
        
        return DispatchRunResponse(
            optimization_version=result.optimization_version,
            computation_time_seconds=result.metrics.computation_time_seconds,
            strategy_used=result.metrics.strategy_used.value,
            num_routes_created=result.metrics.num_routes,
            num_jobs_assigned=result.metrics.num_jobs_routed,
            num_jobs_unassigned=result.metrics.num_jobs_unassigned,
            routes=api_routes,
            unassigned_pickup_ids=[j.source_id for j in result.unassigned_jobs]
        )
