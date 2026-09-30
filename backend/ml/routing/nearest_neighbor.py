"""
Nearest-Neighbor heuristic for route construction.

This is the Phase 1 baseline algorithm from ml_and_routing.md:
    "Start with nearest-neighbor baseline"

Algorithm:
    1. Start at depot.
    2. Find the closest unvisited job that fits in the vehicle.
    3. Add it to the route.
    4. Repeat until no more jobs fit or none are left.
    5. Return to depot (if configured).

Complexity: O(n²) — fast enough for up to ~500 jobs.

This is a greedy constructive heuristic. It produces a feasible solution
quickly, which can then be improved by 2-opt (see two_opt.py).
"""

from __future__ import annotations

from ml.routing.distance import DistanceMatrix
from ml.routing.models import (
    Job,
    Location,
    OptimizedRoute,
    RouteStop,
    VehicleProfile,
)


def nearest_neighbor_single_vehicle(
    depot_idx: int,
    job_indices: list[int],
    jobs: list[Job],
    vehicle: VehicleProfile,
    matrix: DistanceMatrix,
    return_to_depot: bool = True,
) -> tuple[OptimizedRoute, list[int]]:
    """
    Build a single route for one vehicle using nearest-neighbor.

    Args:
        depot_idx:      index of the depot in the distance matrix
        job_indices:    indices (in the distance matrix) of available jobs
        jobs:           the full job list (indexed by job_indices - 1, since depot is 0)
        vehicle:        the vehicle/collector profile
        matrix:         precomputed distance matrix
        return_to_depot: whether vehicle returns to depot at end

    Returns:
        (route, remaining_indices): the constructed route and indices of
        jobs that didn't fit in this vehicle.
    """
    route_stops: list[RouteStop] = []
    visited: set[int] = set()
    current_idx = depot_idx
    current_load = vehicle.current_load_kg
    total_distance = 0.0
    time_offset_min = 0.0

    available = list(job_indices)

    while available:
        # Find nearest unvisited job that fits
        best_idx = None
        best_dist = float("inf")

        for idx in available:
            if idx in visited:
                continue

            # Job is at (idx - 1) in the jobs list if depot is at index 0
            job = jobs[idx - 1] if depot_idx == 0 else jobs[idx]
            new_load = current_load + job.estimated_weight_kg

            # Check capacity constraint
            if new_load > vehicle.capacity_kg:
                continue

            # Check max jobs constraint
            if len(route_stops) >= vehicle.max_jobs:
                continue

            dist = matrix.distance(current_idx, idx)
            if dist < best_dist:
                best_dist = dist
                best_idx = idx

        if best_idx is None:
            break  # No more jobs fit

        # Add this job to the route
        job = jobs[best_idx - 1] if depot_idx == 0 else jobs[best_idx]
        current_load += job.estimated_weight_kg
        total_distance += best_dist
        travel_time_min = matrix.duration(current_idx, best_idx) / 60.0
        time_offset_min += travel_time_min

        stop = RouteStop(
            sequence=len(route_stops),
            job=job,
            arrival_time_offset_minutes=int(time_offset_min),
            cumulative_load_kg=current_load,
            distance_from_previous_m=best_dist,
        )
        route_stops.append(stop)

        # Service time at stop
        time_offset_min += job.service_time_minutes

        visited.add(best_idx)
        available.remove(best_idx)
        current_idx = best_idx

    # Return-to-depot distance
    if return_to_depot and route_stops:
        return_dist = matrix.distance(current_idx, depot_idx)
        total_distance += return_dist
        time_offset_min += matrix.duration(current_idx, depot_idx) / 60.0

    route = OptimizedRoute(
        vehicle=vehicle,
        stops=route_stops,
        total_distance_m=total_distance,
        total_load_kg=current_load,
        estimated_duration_minutes=time_offset_min,
    )

    return route, available


def nearest_neighbor_multi_vehicle(
    depot: Location,
    jobs: list[Job],
    vehicles: list[VehicleProfile],
    matrix: DistanceMatrix,
    return_to_depot: bool = True,
) -> tuple[list[OptimizedRoute], list[Job]]:
    """
    Assign jobs to multiple vehicles using nearest-neighbor.

    Each vehicle greedily picks the nearest feasible job until full,
    then the next vehicle takes over. Vehicles are processed in order
    (sorted by capacity descending to maximize utilization).

    Args:
        depot:          depot location
        jobs:           all jobs to assign
        vehicles:       available vehicles/collectors
        matrix:         precomputed distance matrix (depot at index 0)
        return_to_depot: whether vehicles return to depot

    Returns:
        (routes, unassigned_jobs): list of routes and jobs that couldn't be assigned
    """
    depot_idx = 0  # Convention: depot is always index 0 in the matrix

    # Sort vehicles by capacity (largest first) for better packing
    sorted_vehicles = sorted(
        vehicles, key=lambda v: v.remaining_capacity_kg, reverse=True
    )

    # All job indices (1-based because depot is 0)
    remaining = list(range(1, len(jobs) + 1))
    routes: list[OptimizedRoute] = []

    for vehicle in sorted_vehicles:
        if not remaining:
            break

        route, remaining = nearest_neighbor_single_vehicle(
            depot_idx=depot_idx,
            job_indices=remaining,
            jobs=jobs,
            vehicle=vehicle,
            matrix=matrix,
            return_to_depot=return_to_depot,
        )

        if route.num_stops > 0:
            routes.append(route)

    # Map remaining indices back to Job objects
    unassigned = [jobs[idx - 1] for idx in remaining]

    return routes, unassigned
