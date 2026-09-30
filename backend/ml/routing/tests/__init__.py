"""
Tests for the route optimization engine.

Run with:
    cd waste_management_system_initial_docs
    python -m pytest ml/routing/tests/ -v

These tests use HaversineDistanceProvider (no external API needed).
"""

from __future__ import annotations

import pytest
from datetime import time

from ml.routing.models import (
    Job,
    JobPriority,
    JobSource,
    Location,
    OptimizationStrategy,
    RoutingRequest,
    TimeWindow,
    VehicleProfile,
)
from ml.routing.distance import HaversineDistanceProvider, _haversine
from ml.routing.nearest_neighbor import (
    nearest_neighbor_multi_vehicle,
    nearest_neighbor_single_vehicle,
)
from ml.routing.two_opt import two_opt_improve
from ml.routing.optimizer import RouteOptimizer, OptimizerConfig


# ---------------------------------------------------------------------------
# Fixtures — sample data around Mumbai, India
# ---------------------------------------------------------------------------

DEPOT = Location(lat=19.0760, lng=72.8777)  # Mumbai central

SAMPLE_JOBS = [
    Job(
        id="j1",
        location=Location(lat=19.0896, lng=72.8656),  # Bandra
        source=JobSource.PICKUP_REQUEST,
        source_id="pr-001",
        estimated_weight_kg=25.0,
        priority=JobPriority.MEDIUM,
        category_code="plastic",
        service_time_minutes=10,
    ),
    Job(
        id="j2",
        location=Location(lat=19.1136, lng=72.8697),  # Andheri
        source=JobSource.WASTE_REPORT,
        source_id="wr-001",
        estimated_weight_kg=40.0,
        priority=JobPriority.HIGH,
        category_code="mixed",
        service_time_minutes=15,
    ),
    Job(
        id="j3",
        location=Location(lat=19.0176, lng=72.8562),  # Worli
        source=JobSource.PICKUP_REQUEST,
        source_id="pr-002",
        estimated_weight_kg=15.0,
        priority=JobPriority.LOW,
        category_code="organic",
        service_time_minutes=10,
    ),
    Job(
        id="j4",
        location=Location(lat=19.0596, lng=72.8295),  # Parel
        source=JobSource.WASTE_REPORT,
        source_id="wr-002",
        estimated_weight_kg=60.0,
        priority=JobPriority.CRITICAL,
        category_code="hazardous",
        service_time_minutes=20,
    ),
    Job(
        id="j5",
        location=Location(lat=19.1370, lng=72.8295),  # Goregaon
        source=JobSource.PICKUP_REQUEST,
        source_id="pr-003",
        estimated_weight_kg=30.0,
        priority=JobPriority.MEDIUM,
        category_code="plastic",
        service_time_minutes=10,
    ),
]

SAMPLE_VEHICLES = [
    VehicleProfile(
        id="v1",
        collector_id="col-001",
        capacity_kg=100.0,
        max_jobs=10,
    ),
    VehicleProfile(
        id="v2",
        collector_id="col-002",
        capacity_kg=80.0,
        max_jobs=10,
    ),
]


# ---------------------------------------------------------------------------
# Model validation tests
# ---------------------------------------------------------------------------

class TestModels:
    def test_location_valid(self):
        loc = Location(lat=19.0, lng=72.0)
        assert loc.lat == 19.0
        assert loc.lng == 72.0

    def test_location_invalid_lat(self):
        with pytest.raises(ValueError, match="Latitude"):
            Location(lat=91.0, lng=0.0)

    def test_location_invalid_lng(self):
        with pytest.raises(ValueError, match="Longitude"):
            Location(lat=0.0, lng=181.0)

    def test_time_window_valid(self):
        tw = TimeWindow(start=time(9, 0), end=time(12, 0))
        assert tw.duration_minutes() == 180

    def test_time_window_invalid(self):
        with pytest.raises(ValueError, match="before"):
            TimeWindow(start=time(14, 0), end=time(10, 0))

    def test_job_negative_weight(self):
        with pytest.raises(ValueError, match="negative"):
            Job(
                id="bad",
                location=Location(lat=0, lng=0),
                source=JobSource.WASTE_REPORT,
                source_id="x",
                estimated_weight_kg=-5,
            )

    def test_vehicle_remaining_capacity(self):
        v = VehicleProfile(
            id="v1", collector_id="c1", capacity_kg=100, current_load_kg=30
        )
        assert v.remaining_capacity_kg == 70.0

    def test_routing_request_no_jobs(self):
        with pytest.raises(ValueError, match="at least one job"):
            RoutingRequest(depot=DEPOT, jobs=[], vehicles=SAMPLE_VEHICLES)

    def test_routing_request_no_vehicles(self):
        with pytest.raises(ValueError, match="at least one vehicle"):
            RoutingRequest(depot=DEPOT, jobs=SAMPLE_JOBS, vehicles=[])


# ---------------------------------------------------------------------------
# Distance tests
# ---------------------------------------------------------------------------

class TestDistance:
    def test_haversine_same_point(self):
        d = _haversine(DEPOT, DEPOT)
        assert d == 0.0

    def test_haversine_known_distance(self):
        # Mumbai to Pune is roughly 150 km straight line
        mumbai = Location(lat=19.0760, lng=72.8777)
        pune = Location(lat=18.5204, lng=73.8567)
        d = _haversine(mumbai, pune)
        assert 100_000 < d < 200_000  # between 100 and 200 km

    def test_distance_matrix_shape(self):
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS[:3]]
        matrix = provider.compute_distance_matrix(locations)
        assert matrix.distances_m.shape == (4, 4)
        assert matrix.durations_s.shape == (4, 4)
        assert matrix.size == 4

    def test_distance_matrix_symmetric(self):
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS[:3]]
        matrix = provider.compute_distance_matrix(locations)
        for i in range(matrix.size):
            for j in range(matrix.size):
                assert abs(matrix.distance(i, j) - matrix.distance(j, i)) < 1e-6

    def test_distance_matrix_zero_diagonal(self):
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS[:3]]
        matrix = provider.compute_distance_matrix(locations)
        for i in range(matrix.size):
            assert matrix.distance(i, i) == 0.0

    def test_detour_factor(self):
        p1 = HaversineDistanceProvider(detour_factor=1.0)
        p2 = HaversineDistanceProvider(detour_factor=1.5)
        locs = [DEPOT, SAMPLE_JOBS[0].location]
        m1 = p1.compute_distance_matrix(locs)
        m2 = p2.compute_distance_matrix(locs)
        assert m2.distance(0, 1) == pytest.approx(m1.distance(0, 1) * 1.5, rel=1e-6)


# ---------------------------------------------------------------------------
# Nearest-Neighbor tests
# ---------------------------------------------------------------------------

class TestNearestNeighbor:
    def test_single_vehicle_all_jobs(self):
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        big_vehicle = VehicleProfile(
            id="v1", collector_id="c1", capacity_kg=1000, max_jobs=50
        )

        route, remaining = nearest_neighbor_single_vehicle(
            depot_idx=0,
            job_indices=list(range(1, len(SAMPLE_JOBS) + 1)),
            jobs=SAMPLE_JOBS,
            vehicle=big_vehicle,
            matrix=matrix,
        )

        assert route.num_stops == len(SAMPLE_JOBS)
        assert len(remaining) == 0
        assert route.total_distance_m > 0
        assert route.total_load_kg == sum(j.estimated_weight_kg for j in SAMPLE_JOBS)

    def test_capacity_constraint(self):
        """Vehicle can't carry all jobs — some should remain."""
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        # Total weight = 25+40+15+60+30 = 170 kg, vehicle only has 50 kg
        small_vehicle = VehicleProfile(
            id="v1", collector_id="c1", capacity_kg=50, max_jobs=50
        )

        route, remaining = nearest_neighbor_single_vehicle(
            depot_idx=0,
            job_indices=list(range(1, len(SAMPLE_JOBS) + 1)),
            jobs=SAMPLE_JOBS,
            vehicle=small_vehicle,
            matrix=matrix,
        )

        assert route.num_stops < len(SAMPLE_JOBS)
        assert len(remaining) > 0
        assert route.total_load_kg <= 50.0

    def test_multi_vehicle(self):
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        routes, unassigned = nearest_neighbor_multi_vehicle(
            depot=DEPOT,
            jobs=SAMPLE_JOBS,
            vehicles=SAMPLE_VEHICLES,  # 100kg + 80kg = 180kg total
            matrix=matrix,
        )

        total_assigned = sum(r.num_stops for r in routes)
        assert total_assigned + len(unassigned) == len(SAMPLE_JOBS)

        # Each route should respect its vehicle's capacity
        for route in routes:
            assert route.total_load_kg <= route.vehicle.capacity_kg

    def test_multi_vehicle_covers_all(self):
        """With enough capacity, all jobs should be assigned."""
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        big_vehicles = [
            VehicleProfile(id="v1", collector_id="c1", capacity_kg=500, max_jobs=50),
            VehicleProfile(id="v2", collector_id="c2", capacity_kg=500, max_jobs=50),
        ]

        routes, unassigned = nearest_neighbor_multi_vehicle(
            depot=DEPOT, jobs=SAMPLE_JOBS, vehicles=big_vehicles, matrix=matrix,
        )

        assert len(unassigned) == 0
        total_stops = sum(r.num_stops for r in routes)
        assert total_stops == len(SAMPLE_JOBS)


# ---------------------------------------------------------------------------
# 2-opt tests
# ---------------------------------------------------------------------------

class TestTwoOpt:
    def test_two_opt_improves_or_equals(self):
        """2-opt should produce a route no longer than the input."""
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        big_vehicle = VehicleProfile(
            id="v1", collector_id="c1", capacity_kg=1000, max_jobs=50
        )

        nn_route, _ = nearest_neighbor_single_vehicle(
            depot_idx=0,
            job_indices=list(range(1, len(SAMPLE_JOBS) + 1)),
            jobs=SAMPLE_JOBS,
            vehicle=big_vehicle,
            matrix=matrix,
        )

        improved_route = two_opt_improve(
            route=nn_route, matrix=matrix, depot_idx=0,
        )

        assert improved_route.total_distance_m <= nn_route.total_distance_m + 1.0
        assert improved_route.num_stops == nn_route.num_stops

    def test_two_opt_preserves_load(self):
        """2-opt reorders stops but total load should be the same."""
        provider = HaversineDistanceProvider()
        locations = [DEPOT] + [j.location for j in SAMPLE_JOBS]
        matrix = provider.compute_distance_matrix(locations)

        big_vehicle = VehicleProfile(
            id="v1", collector_id="c1", capacity_kg=1000, max_jobs=50
        )

        nn_route, _ = nearest_neighbor_single_vehicle(
            depot_idx=0,
            job_indices=list(range(1, len(SAMPLE_JOBS) + 1)),
            jobs=SAMPLE_JOBS,
            vehicle=big_vehicle,
            matrix=matrix,
        )

        improved = two_opt_improve(route=nn_route, matrix=matrix)
        assert abs(improved.total_load_kg - nn_route.total_load_kg) < 0.01


# ---------------------------------------------------------------------------
# Optimizer (orchestrator) tests
# ---------------------------------------------------------------------------

class TestOptimizer:
    def test_optimize_auto_small(self):
        """Small problem should auto-select NN+2-opt."""
        optimizer = RouteOptimizer(
            distance_provider=HaversineDistanceProvider(),
        )

        request = RoutingRequest(
            depot=DEPOT,
            jobs=SAMPLE_JOBS,
            vehicles=SAMPLE_VEHICLES,
            strategy=OptimizationStrategy.AUTO,
        )

        result = optimizer.optimize(request)

        assert result.metrics.num_routes > 0
        total = result.metrics.num_jobs_routed + result.metrics.num_jobs_unassigned
        assert total == len(SAMPLE_JOBS)
        assert result.metrics.computation_time_seconds > 0
        assert result.metrics.strategy_used in (
            OptimizationStrategy.NEAREST_NEIGHBOR,
            OptimizationStrategy.TWO_OPT,
        )
        assert result.optimization_version == "1.0.0"

    def test_optimize_explicit_nn(self):
        optimizer = RouteOptimizer()
        request = RoutingRequest(
            depot=DEPOT,
            jobs=SAMPLE_JOBS[:3],
            vehicles=[SAMPLE_VEHICLES[0]],
            strategy=OptimizationStrategy.NEAREST_NEIGHBOR,
        )

        result = optimizer.optimize(request)
        assert result.metrics.strategy_used == OptimizationStrategy.NEAREST_NEIGHBOR

    def test_optimize_all_routes_valid(self):
        """Every route should have valid stops with positive distances."""
        optimizer = RouteOptimizer()
        request = RoutingRequest(
            depot=DEPOT,
            jobs=SAMPLE_JOBS,
            vehicles=SAMPLE_VEHICLES,
        )

        result = optimizer.optimize(request)

        for route in result.routes:
            assert route.num_stops > 0
            assert route.total_distance_m > 0
            assert route.estimated_duration_minutes > 0
            assert route.total_load_kg <= route.vehicle.capacity_kg

            # Stops should be sequentially numbered
            for i, stop in enumerate(route.stops):
                assert stop.sequence == i

    def test_optimize_metrics_consistent(self):
        optimizer = RouteOptimizer()
        request = RoutingRequest(
            depot=DEPOT,
            jobs=SAMPLE_JOBS,
            vehicles=SAMPLE_VEHICLES,
        )

        result = optimizer.optimize(request)
        m = result.metrics

        # Total distance should match sum of route distances
        route_total = sum(r.total_distance_m for r in result.routes)
        assert abs(m.total_distance_m - route_total) < 1.0

        # Total jobs should equal input
        assert m.num_jobs_routed + m.num_jobs_unassigned == len(SAMPLE_JOBS)

    def test_single_job_single_vehicle(self):
        """Simplest case: one job, one vehicle."""
        optimizer = RouteOptimizer()
        request = RoutingRequest(
            depot=DEPOT,
            jobs=[SAMPLE_JOBS[0]],
            vehicles=[SAMPLE_VEHICLES[0]],
        )

        result = optimizer.optimize(request)
        assert result.metrics.num_routes == 1
        assert result.metrics.num_jobs_routed == 1
        assert result.metrics.num_jobs_unassigned == 0
        assert result.routes[0].num_stops == 1
