"""
2-opt local search improvement for route optimization.

This is the Phase 1 improvement step from ml_and_routing.md:
    "2-opt improvement"

Algorithm:
    Given an existing route (e.g., from nearest-neighbor):
    1. Take two non-adjacent edges in the route.
    2. Reconnect them by reversing the segment between them.
    3. If the new route is shorter, keep it.
    4. Repeat until no improving swap is found (local optimum).

Complexity: O(n²) per iteration, typically converges in O(n) iterations.
Total: roughly O(n³) worst case, but usually much faster in practice.

The 2-opt move:
    Before:  ... → A → B → ... → C → D → ...
    After:   ... → A → C → ... → B → D → ...
    (the segment B...C is reversed)
"""

from __future__ import annotations

import copy

from ml.routing.distance import DistanceMatrix
from ml.routing.models import OptimizedRoute, RouteStop


def _route_distance(
    stop_indices: list[int],
    depot_idx: int,
    matrix: DistanceMatrix,
    return_to_depot: bool,
) -> float:
    """Compute total distance for a route given as a list of matrix indices."""
    if not stop_indices:
        return 0.0

    total = matrix.distance(depot_idx, stop_indices[0])

    for i in range(len(stop_indices) - 1):
        total += matrix.distance(stop_indices[i], stop_indices[i + 1])

    if return_to_depot:
        total += matrix.distance(stop_indices[-1], depot_idx)

    return total


def two_opt_improve(
    route: OptimizedRoute,
    matrix: DistanceMatrix,
    depot_idx: int = 0,
    return_to_depot: bool = True,
    max_iterations: int = 1000,
    improvement_threshold: float = 1.0,
) -> OptimizedRoute:
    """
    Improve a single route using 2-opt local search.

    Args:
        route:                  the route to improve (from nearest-neighbor or other)
        matrix:                 distance matrix
        depot_idx:              index of depot in the matrix
        return_to_depot:        whether route returns to depot
        max_iterations:         max number of full passes over all edge pairs
        improvement_threshold:  minimum distance improvement (meters) to accept a swap

    Returns:
        An improved OptimizedRoute with potentially reordered stops.
    """
    if route.num_stops <= 2:
        return route  # Nothing to improve with fewer than 3 stops

    # Extract the matrix indices for each stop
    # We need to figure out which matrix index corresponds to each stop
    # Convention: depot=0, jobs are 1..N in matrix order
    # We reconstruct indices from the stop's job.id
    stop_indices = _get_stop_matrix_indices(route, matrix, depot_idx)

    best_indices = list(stop_indices)
    best_distance = _route_distance(best_indices, depot_idx, matrix, return_to_depot)
    improved = True
    iteration = 0

    while improved and iteration < max_iterations:
        improved = False
        iteration += 1

        for i in range(len(best_indices) - 1):
            for j in range(i + 2, len(best_indices)):
                # Try reversing the segment between i+1 and j
                new_indices = (
                    best_indices[: i + 1]
                    + best_indices[i + 1 : j + 1][::-1]
                    + best_indices[j + 1 :]
                )

                new_distance = _route_distance(
                    new_indices, depot_idx, matrix, return_to_depot
                )

                if new_distance < best_distance - improvement_threshold:
                    best_indices = new_indices
                    best_distance = new_distance
                    improved = True

    # Rebuild the route with the improved order
    return _rebuild_route(route, best_indices, matrix, depot_idx, return_to_depot)


def two_opt_improve_all(
    routes: list[OptimizedRoute],
    matrix: DistanceMatrix,
    depot_idx: int = 0,
    return_to_depot: bool = True,
    max_iterations: int = 1000,
) -> list[OptimizedRoute]:
    """
    Apply 2-opt improvement to every route in the solution.

    Args:
        routes:         list of routes to improve
        matrix:         distance matrix
        depot_idx:      index of depot
        return_to_depot: whether routes return to depot
        max_iterations: max iterations per route

    Returns:
        List of improved routes.
    """
    return [
        two_opt_improve(
            route=r,
            matrix=matrix,
            depot_idx=depot_idx,
            return_to_depot=return_to_depot,
            max_iterations=max_iterations,
        )
        for r in routes
    ]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_stop_matrix_indices(
    route: OptimizedRoute,
    matrix: DistanceMatrix,
    depot_idx: int,
) -> list[int]:
    """
    Map route stops back to their indices in the distance matrix.

    Since we use the convention depot=0, jobs are 1..N,
    we match by location coordinates.
    """
    indices = []
    for stop in route.stops:
        loc = stop.job.location
        # Find this location in the matrix
        for idx, matrix_loc in enumerate(matrix.locations):
            if idx == depot_idx:
                continue
            if (
                abs(matrix_loc.lat - loc.lat) < 1e-8
                and abs(matrix_loc.lng - loc.lng) < 1e-8
            ):
                indices.append(idx)
                break
    return indices


def _rebuild_route(
    original: OptimizedRoute,
    new_indices: list[int],
    matrix: DistanceMatrix,
    depot_idx: int,
    return_to_depot: bool,
) -> OptimizedRoute:
    """Rebuild an OptimizedRoute from reordered matrix indices."""
    route = copy.deepcopy(original)

    # Build a lookup: matrix_index → original RouteStop
    index_to_stop: dict[int, RouteStop] = {}
    original_indices = _get_stop_matrix_indices(original, matrix, depot_idx)
    for idx, stop in zip(original_indices, original.stops):
        index_to_stop[idx] = stop

    # Rebuild stops in new order
    new_stops: list[RouteStop] = []
    current_idx = depot_idx
    cumulative_load = 0.0
    time_offset = 0.0
    total_distance = 0.0

    for seq, idx in enumerate(new_indices):
        old_stop = index_to_stop[idx]
        dist = matrix.distance(current_idx, idx)
        travel_time_min = matrix.duration(current_idx, idx) / 60.0
        time_offset += travel_time_min
        total_distance += dist
        cumulative_load += old_stop.job.estimated_weight_kg

        new_stop = RouteStop(
            sequence=seq,
            job=old_stop.job,
            arrival_time_offset_minutes=int(time_offset),
            cumulative_load_kg=cumulative_load,
            distance_from_previous_m=dist,
        )
        new_stops.append(new_stop)
        time_offset += old_stop.job.service_time_minutes
        current_idx = idx

    # Return to depot
    if return_to_depot and new_stops:
        total_distance += matrix.distance(current_idx, depot_idx)
        time_offset += matrix.duration(current_idx, depot_idx) / 60.0

    route.stops = new_stops
    route.total_distance_m = total_distance
    route.total_load_kg = cumulative_load
    route.estimated_duration_minutes = time_offset

    return route
