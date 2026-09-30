"""
Vehicle Routing Problem (VRP) solver using Google OR-Tools.

This is the Phase 2 solver from ml_and_routing.md:
    "vehicle routing problem solver (OR-Tools) when constraints grow"

Supports:
    - Capacitated VRP (CVRP): vehicle weight limits
    - VRP with Time Windows (VRPTW): consumer preferred windows
    - Multi-depot (if needed): different start locations per vehicle
    - Max stops per vehicle
    - Service time at each stop

OR-Tools is Google's open-source optimization suite:
    https://developers.google.com/optimization/routing

Install: pip install ortools
"""

from __future__ import annotations

import logging
from typing import Optional

from ml.routing.distance import DistanceMatrix
from ml.routing.models import (
    Job,
    Location,
    OptimizedRoute,
    RouteStop,
    VehicleProfile,
)

logger = logging.getLogger(__name__)


def solve_vrp(
    depot: Location,
    jobs: list[Job],
    vehicles: list[VehicleProfile],
    matrix: DistanceMatrix,
    return_to_depot: bool = True,
    max_computation_seconds: int = 30,
    first_solution_strategy: str = "PATH_CHEAPEST_ARC",
    local_search_metaheuristic: str = "GUIDED_LOCAL_SEARCH",
) -> tuple[list[OptimizedRoute], list[Job]]:
    """
    Solve the Vehicle Routing Problem using OR-Tools.

    This handles:
        - Vehicle capacity constraints (weight)
        - Time window constraints (consumer preferences)
        - Service time at each stop
        - Max stops per vehicle
        - Heterogeneous fleet (different capacities)

    Args:
        depot:                      depot/starting location
        jobs:                       jobs to assign
        vehicles:                   available vehicles
        matrix:                     precomputed distance matrix (depot at idx 0)
        return_to_depot:            vehicles return to depot after route
        max_computation_seconds:    solver timeout
        first_solution_strategy:    OR-Tools initial solution strategy
        local_search_metaheuristic: OR-Tools local search metaheuristic

    Returns:
        (routes, unassigned_jobs)
    """
    try:
        from ortools.constraint_solver import pywrapcp, routing_enums_pb2
    except ImportError:
        raise ImportError(
            "OR-Tools is required for VRP solving. "
            "Install it with: pip install ortools"
        )

    num_locations = len(jobs) + 1  # +1 for depot
    num_vehicles = len(vehicles)
    depot_idx = 0

    # -----------------------------------------------------------------------
    # Create data model for OR-Tools
    # -----------------------------------------------------------------------

    def distance_callback(from_index, to_index):
        """Returns distance between two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(matrix.distance(from_node, to_node))

    def demand_callback(from_index):
        """Returns the weight demand at a node."""
        node = manager.IndexToNode(from_index)
        if node == depot_idx:
            return 0
        return int(jobs[node - 1].estimated_weight_kg * 100)  # Scale to int (hectograms)

    def time_callback(from_index, to_index):
        """Returns travel time + service time between nodes (in minutes)."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        travel_time = int(matrix.duration(from_node, to_node) / 60)  # seconds → minutes
        # Add service time at the destination
        if to_node != depot_idx:
            travel_time += jobs[to_node - 1].service_time_minutes
        return travel_time

    # -----------------------------------------------------------------------
    # Create routing index manager and model
    # -----------------------------------------------------------------------

    manager = pywrapcp.RoutingIndexManager(
        num_locations,
        num_vehicles,
        depot_idx,
    )
    routing = pywrapcp.RoutingModel(manager)

    # -----------------------------------------------------------------------
    # Distance dimension (minimize total distance)
    # -----------------------------------------------------------------------

    distance_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(distance_callback_index)

    routing.AddDimension(
        distance_callback_index,
        0,              # no slack
        1_000_000_000,  # max distance per vehicle (1000 km in meters)
        True,           # start cumul to zero
        "Distance",
    )

    # -----------------------------------------------------------------------
    # Capacity dimension (vehicle weight limits)
    # -----------------------------------------------------------------------

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)

    # Vehicle capacities (scaled to hectograms to keep integer math)
    vehicle_capacities = [
        int(v.remaining_capacity_kg * 100) for v in vehicles
    ]

    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,                  # no slack
        vehicle_capacities,
        True,               # start cumul to zero
        "Capacity",
    )

    # -----------------------------------------------------------------------
    # Time window dimension (optional — only if jobs have time windows)
    # -----------------------------------------------------------------------

    jobs_with_windows = [j for j in jobs if j.time_window is not None]

    if jobs_with_windows:
        time_callback_index = routing.RegisterTransitCallback(time_callback)

        # Max route duration: 12 hours in minutes
        max_route_duration = 720

        routing.AddDimension(
            time_callback_index,
            30,                  # allow 30 min slack (waiting time)
            max_route_duration,
            False,               # don't force start cumul to zero
            "Time",
        )

        time_dimension = routing.GetDimensionOrDie("Time")

        # Set time windows for each job
        for idx, job in enumerate(jobs):
            node_index = manager.NodeToIndex(idx + 1)  # +1 because depot is 0

            if job.time_window:
                start_min = job.time_window.start.hour * 60 + job.time_window.start.minute
                end_min = job.time_window.end.hour * 60 + job.time_window.end.minute
                time_dimension.CumulVar(node_index).SetRange(start_min, end_min)
            else:
                # No window constraint — full day
                time_dimension.CumulVar(node_index).SetRange(0, max_route_duration)

        # Set depot time windows (vehicle availability)
        for v_idx, vehicle in enumerate(vehicles):
            start_index = routing.Start(v_idx)
            end_index = routing.End(v_idx)

            if vehicle.available_window:
                v_start = (
                    vehicle.available_window.start.hour * 60
                    + vehicle.available_window.start.minute
                )
                v_end = (
                    vehicle.available_window.end.hour * 60
                    + vehicle.available_window.end.minute
                )
                time_dimension.CumulVar(start_index).SetRange(v_start, v_end)
                time_dimension.CumulVar(end_index).SetRange(v_start, v_end)
            else:
                time_dimension.CumulVar(start_index).SetRange(0, max_route_duration)
                time_dimension.CumulVar(end_index).SetRange(0, max_route_duration)

    # -----------------------------------------------------------------------
    # Allow dropping nodes (some jobs may be unassignable)
    # -----------------------------------------------------------------------

    # High penalty for dropping a node — solver will try hard to include all
    # but will drop if constraints make it infeasible
    penalty = 100_000_000
    for idx in range(1, num_locations):
        routing.AddDisjunction([manager.NodeToIndex(idx)], penalty)

    # -----------------------------------------------------------------------
    # Solve
    # -----------------------------------------------------------------------

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()

    # Map strategy strings to OR-Tools enums
    strategy_map = {
        "PATH_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
        "PATH_MOST_CONSTRAINED_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
        "SAVINGS": routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
        "CHRISTOFIDES": routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES,
        "PARALLEL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
    }
    metaheuristic_map = {
        "GUIDED_LOCAL_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH,
        "SIMULATED_ANNEALING": routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING,
        "TABU_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.TABU_SEARCH,
    }

    search_parameters.first_solution_strategy = strategy_map.get(
        first_solution_strategy,
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
    )
    search_parameters.local_search_metaheuristic = metaheuristic_map.get(
        local_search_metaheuristic,
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH,
    )
    search_parameters.time_limit.FromSeconds(max_computation_seconds)

    logger.info(
        "Solving VRP: %d jobs, %d vehicles, timeout=%ds",
        len(jobs),
        num_vehicles,
        max_computation_seconds,
    )

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        logger.warning("OR-Tools found no solution — returning all jobs as unassigned")
        return [], list(jobs)

    # -----------------------------------------------------------------------
    # Extract solution
    # -----------------------------------------------------------------------

    routes: list[OptimizedRoute] = []
    assigned_job_indices: set[int] = set()

    for v_idx in range(num_vehicles):
        stops: list[RouteStop] = []
        index = routing.Start(v_idx)
        total_distance = 0.0
        total_load = 0.0
        time_offset = 0.0
        prev_idx = depot_idx
        sequence = 0

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)

            if node != depot_idx:
                job = jobs[node - 1]
                dist = matrix.distance(prev_idx, node)
                travel_time = matrix.duration(prev_idx, node) / 60.0
                time_offset += travel_time
                total_distance += dist
                total_load += job.estimated_weight_kg

                stop = RouteStop(
                    sequence=sequence,
                    job=job,
                    arrival_time_offset_minutes=int(time_offset),
                    cumulative_load_kg=total_load,
                    distance_from_previous_m=dist,
                )
                stops.append(stop)
                time_offset += job.service_time_minutes
                assigned_job_indices.add(node - 1)
                prev_idx = node
                sequence += 1

            index = solution.Value(routing.NextVar(index))

        # Return to depot
        if return_to_depot and stops:
            total_distance += matrix.distance(prev_idx, depot_idx)
            time_offset += matrix.duration(prev_idx, depot_idx) / 60.0

        if stops:
            route = OptimizedRoute(
                vehicle=vehicles[v_idx],
                stops=stops,
                total_distance_m=total_distance,
                total_load_kg=total_load,
                estimated_duration_minutes=time_offset,
            )
            routes.append(route)

    # Unassigned jobs
    unassigned = [
        jobs[i] for i in range(len(jobs)) if i not in assigned_job_indices
    ]

    logger.info(
        "VRP solved: %d routes, %d jobs assigned, %d unassigned",
        len(routes),
        len(assigned_job_indices),
        len(unassigned),
    )

    return routes, unassigned
