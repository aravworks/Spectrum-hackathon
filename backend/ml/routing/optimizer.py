"""
Route Optimizer — main orchestrator.

This is the single entry point that the backend dispatch module calls.
It selects the appropriate algorithm based on problem size and strategy,
runs the optimization, and returns a standardized RoutingResult.

Algorithm selection (AUTO mode):
    - ≤ 10 jobs  → Nearest-Neighbor + 2-opt (fast, good enough)
    - ≤ 200 jobs → OR-Tools VRP (optimal within time limit)
    - > 200 jobs → OR-Tools VRP with relaxed parameters

The optimizer is stateless and has NO database dependency. The backend
dispatch module is responsible for:
    1. Querying unassigned jobs from DB → constructing RoutingRequest
    2. Calling optimizer.optimize(request)
    3. Persisting RoutingResult back to DB (routes, pickup_jobs tables)
"""

from __future__ import annotations

import logging
import time as time_module
from dataclasses import dataclass
from typing import Optional

from ml.routing.distance import (
    DistanceMatrix,
    DistanceProvider,
    HaversineDistanceProvider,
)
from ml.routing.models import (
    Location,
    OptimizationStrategy,
    OptimizedRoute,
    RoutingMetrics,
    RoutingRequest,
    RoutingResult,
)
from ml.routing.nearest_neighbor import nearest_neighbor_multi_vehicle
from ml.routing.two_opt import two_opt_improve_all

logger = logging.getLogger(__name__)

# Threshold: below this job count, use NN+2-opt; above, use OR-Tools
_SMALL_PROBLEM_THRESHOLD = 10
_VERSION = "1.0.0"


@dataclass
class OptimizerConfig:
    """Configuration for the route optimizer."""
    default_strategy: OptimizationStrategy = OptimizationStrategy.AUTO
    max_computation_seconds: int = 30
    two_opt_max_iterations: int = 1000
    two_opt_improvement_threshold_m: float = 1.0
    vrp_first_solution_strategy: str = "PATH_CHEAPEST_ARC"
    vrp_metaheuristic: str = "GUIDED_LOCAL_SEARCH"
    small_problem_threshold: int = _SMALL_PROBLEM_THRESHOLD


class RouteOptimizer:
    """
    Main route optimization engine.

    Usage:
        from ml.routing import RouteOptimizer, RoutingRequest
        from ml.routing.distance import HaversineDistanceProvider

        optimizer = RouteOptimizer(
            distance_provider=HaversineDistanceProvider(),
        )
        result = optimizer.optimize(request)

    The optimizer:
        1. Computes the distance matrix for all locations.
        2. Selects the best algorithm based on problem size.
        3. Runs the optimization.
        4. Returns a RoutingResult with routes, unassigned jobs, and metrics.
    """

    def __init__(
        self,
        distance_provider: Optional[DistanceProvider] = None,
        config: Optional[OptimizerConfig] = None,
    ):
        self.distance_provider = distance_provider or HaversineDistanceProvider()
        self.config = config or OptimizerConfig()

    def optimize(self, request: RoutingRequest) -> RoutingResult:
        """
        Run route optimization for the given request.

        Args:
            request: RoutingRequest with depot, jobs, vehicles, strategy

        Returns:
            RoutingResult with optimized routes, unassigned jobs, and metrics
        """
        start_time = time_module.monotonic()

        logger.info(
            "Starting route optimization: %d jobs, %d vehicles, strategy=%s",
            len(request.jobs),
            len(request.vehicles),
            request.strategy.value,
        )

        # Step 1: Build the distance matrix
        # Locations: [depot, job1, job2, ..., jobN]
        locations = [request.depot] + [job.location for job in request.jobs]
        matrix = self.distance_provider.compute_distance_matrix(locations)

        logger.info("Distance matrix computed: %d×%d", matrix.size, matrix.size)

        # Step 2: Select strategy
        strategy = self._select_strategy(request)

        # Step 3: Run the appropriate algorithm
        if strategy in (
            OptimizationStrategy.NEAREST_NEIGHBOR,
            OptimizationStrategy.TWO_OPT,
        ):
            routes, unassigned = self._run_nn_two_opt(
                request, matrix, strategy
            )
        elif strategy == OptimizationStrategy.VRP_ORTOOLS:
            routes, unassigned = self._run_vrp(request, matrix)
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

        # Step 4: Build result with metrics
        elapsed = time_module.monotonic() - start_time

        metrics = self._compute_metrics(
            routes=routes,
            unassigned=unassigned,
            strategy=strategy,
            computation_time=elapsed,
        )

        result = RoutingResult(
            routes=routes,
            unassigned_jobs=unassigned,
            metrics=metrics,
            optimization_version=_VERSION,
        )

        logger.info(
            "Optimization complete: %d routes, %d assigned, %d unassigned, "
            "total_distance=%.0fm, took=%.2fs",
            metrics.num_routes,
            metrics.num_jobs_routed,
            metrics.num_jobs_unassigned,
            metrics.total_distance_m,
            elapsed,
        )

        return result

    def _select_strategy(self, request: RoutingRequest) -> OptimizationStrategy:
        """Select the best strategy based on problem size and request."""
        if request.strategy != OptimizationStrategy.AUTO:
            return request.strategy

        num_jobs = len(request.jobs)

        if num_jobs <= self.config.small_problem_threshold:
            logger.info(
                "AUTO: %d jobs ≤ threshold %d → using NN + 2-opt",
                num_jobs,
                self.config.small_problem_threshold,
            )
            return OptimizationStrategy.TWO_OPT

        # Check if OR-Tools is available
        try:
            import ortools  # noqa: F401
            logger.info(
                "AUTO: %d jobs > threshold → using OR-Tools VRP", num_jobs
            )
            return OptimizationStrategy.VRP_ORTOOLS
        except ImportError:
            logger.warning(
                "OR-Tools not installed — falling back to NN + 2-opt for %d jobs",
                num_jobs,
            )
            return OptimizationStrategy.TWO_OPT

    def _run_nn_two_opt(
        self,
        request: RoutingRequest,
        matrix: DistanceMatrix,
        strategy: OptimizationStrategy,
    ) -> tuple[list[OptimizedRoute], list]:
        """Run nearest-neighbor, optionally followed by 2-opt improvement."""
        routes, unassigned = nearest_neighbor_multi_vehicle(
            depot=request.depot,
            jobs=request.jobs,
            vehicles=request.vehicles,
            matrix=matrix,
            return_to_depot=request.return_to_depot,
        )

        if strategy == OptimizationStrategy.TWO_OPT and routes:
            logger.info("Applying 2-opt improvement to %d routes", len(routes))
            routes = two_opt_improve_all(
                routes=routes,
                matrix=matrix,
                depot_idx=0,
                return_to_depot=request.return_to_depot,
                max_iterations=self.config.two_opt_max_iterations,
            )

        return routes, unassigned

    def _run_vrp(
        self,
        request: RoutingRequest,
        matrix: DistanceMatrix,
    ) -> tuple[list[OptimizedRoute], list]:
        """Run OR-Tools VRP solver."""
        from ml.routing.vrp_solver import solve_vrp

        return solve_vrp(
            depot=request.depot,
            jobs=request.jobs,
            vehicles=request.vehicles,
            matrix=matrix,
            return_to_depot=request.return_to_depot,
            max_computation_seconds=(
                request.max_computation_seconds
                or self.config.max_computation_seconds
            ),
            first_solution_strategy=self.config.vrp_first_solution_strategy,
            local_search_metaheuristic=self.config.vrp_metaheuristic,
        )

    def _compute_metrics(
        self,
        routes: list[OptimizedRoute],
        unassigned: list,
        strategy: OptimizationStrategy,
        computation_time: float,
    ) -> RoutingMetrics:
        """Compute quality and performance metrics for the solution."""
        total_dist = sum(r.total_distance_m for r in routes)
        total_dur = sum(r.estimated_duration_minutes for r in routes)
        total_load = sum(r.total_load_kg for r in routes)
        num_routed = sum(r.num_stops for r in routes)

        utilizations = [r.utilization_pct for r in routes if r.vehicle]
        avg_util = sum(utilizations) / len(utilizations) if utilizations else 0.0

        return RoutingMetrics(
            total_distance_m=total_dist,
            total_duration_minutes=total_dur,
            total_load_kg=total_load,
            num_routes=len(routes),
            num_jobs_routed=num_routed,
            num_jobs_unassigned=len(unassigned),
            avg_utilization_pct=avg_util,
            computation_time_seconds=computation_time,
            strategy_used=strategy,
        )
