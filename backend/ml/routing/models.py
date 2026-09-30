"""
Data models for the route optimization engine.

These are pure data classes — no DB dependency. The backend/dispatch module
is responsible for hydrating these from the database (which your teammate
is preparing) and persisting results back.

DB tables consumed (via backend adapter):
    - pickup_requests  → Job
    - waste_reports     → Job
    - routes            → OptimizedRoute (output)
    - pickup_jobs       → assignment mapping (output)
    - cities            → geofence / depot lookup
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, time
from enum import Enum
from typing import Optional


class JobPriority(str, Enum):
    """Priority levels for collection jobs."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class JobSource(str, Enum):
    """Where the job originated — a waste report or a pickup request."""
    WASTE_REPORT = "waste_report"
    PICKUP_REQUEST = "pickup_request"


class OptimizationStrategy(str, Enum):
    """Which algorithm to use for route optimization."""
    NEAREST_NEIGHBOR = "nearest_neighbor"       # Phase 1 baseline
    TWO_OPT = "two_opt"                         # Phase 1 improvement
    VRP_ORTOOLS = "vrp_ortools"                 # Phase 2 full solver
    AUTO = "auto"                               # Pick best based on problem size


@dataclass(frozen=True)
class Location:
    """A geographic point in WGS84 (SRID 4326)."""
    lat: float
    lng: float

    def __post_init__(self):
        if not (-90 <= self.lat <= 90):
            raise ValueError(f"Latitude {self.lat} out of range [-90, 90]")
        if not (-180 <= self.lng <= 180):
            raise ValueError(f"Longitude {self.lng} out of range [-180, 180]")

    def as_tuple(self) -> tuple[float, float]:
        return (self.lat, self.lng)


@dataclass(frozen=True)
class TimeWindow:
    """A time window for pickup scheduling."""
    start: time
    end: time

    def __post_init__(self):
        if self.start >= self.end:
            raise ValueError(
                f"TimeWindow start ({self.start}) must be before end ({self.end})"
            )

    def duration_minutes(self) -> int:
        """Total minutes in this window."""
        start_min = self.start.hour * 60 + self.start.minute
        end_min = self.end.hour * 60 + self.end.minute
        return end_min - start_min


@dataclass
class Job:
    """
    A single collection job to be routed.

    Hydrated from either a waste_report or pickup_request by the backend
    dispatch adapter (DB integration is your teammate's responsibility).
    """
    id: str
    location: Location
    source: JobSource
    source_id: str                                  # FK to waste_report.id or pickup_request.id
    estimated_weight_kg: float
    priority: JobPriority = JobPriority.MEDIUM
    category_code: Optional[str] = None             # waste category for grouping
    time_window: Optional[TimeWindow] = None        # consumer's preferred window
    service_time_minutes: int = 15                  # estimated time at stop
    notes: Optional[str] = None

    def __post_init__(self):
        if self.estimated_weight_kg < 0:
            raise ValueError("estimated_weight_kg cannot be negative")
        if self.service_time_minutes < 0:
            raise ValueError("service_time_minutes cannot be negative")


@dataclass
class VehicleProfile:
    """
    A collector's vehicle with capacity and availability constraints.
    """
    id: str
    collector_id: str
    capacity_kg: float
    max_jobs: int = 50                              # max stops per route
    start_location: Optional[Location] = None       # defaults to depot
    end_location: Optional[Location] = None         # defaults to depot
    available_window: Optional[TimeWindow] = None   # collector's shift
    current_load_kg: float = 0.0                    # already loaded weight

    @property
    def remaining_capacity_kg(self) -> float:
        return self.capacity_kg - self.current_load_kg


@dataclass
class RoutingRequest:
    """
    Full input to the route optimizer.

    The dispatch module (backend) constructs this from DB records and calls
    the optimizer. The optimizer is stateless and has no DB dependency.
    """
    depot: Location                                 # depot / starting point
    jobs: list[Job]                                 # unassigned jobs to route
    vehicles: list[VehicleProfile]                  # available collectors
    strategy: OptimizationStrategy = OptimizationStrategy.AUTO
    max_computation_seconds: int = 30               # timeout for solver
    return_to_depot: bool = True                    # vehicles return after route?
    route_date: Optional[datetime] = None           # the date these routes are for

    def __post_init__(self):
        if not self.jobs:
            raise ValueError("RoutingRequest must have at least one job")
        if not self.vehicles:
            raise ValueError("RoutingRequest must have at least one vehicle")


@dataclass
class RouteStop:
    """A single stop in an optimized route."""
    sequence: int                                   # 0-indexed order in route
    job: Job
    arrival_time_offset_minutes: int                # estimated minutes from route start
    cumulative_load_kg: float                       # load after this pickup
    distance_from_previous_m: float                 # meters from last stop


@dataclass
class OptimizedRoute:
    """
    An optimized route assigned to a single vehicle/collector.

    This maps to the `routes` table in the DB:
        - geometry: LineString built from the stop sequence
        - distance_m: total_distance_m
        - duration_s: estimated_duration_minutes * 60
        - optimization_version: metadata.strategy + version
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    vehicle: VehicleProfile = field(default_factory=lambda: None)
    stops: list[RouteStop] = field(default_factory=list)
    total_distance_m: float = 0.0
    total_load_kg: float = 0.0
    estimated_duration_minutes: float = 0.0

    @property
    def num_stops(self) -> int:
        return len(self.stops)

    @property
    def utilization_pct(self) -> float:
        """What percentage of vehicle capacity is used."""
        if self.vehicle and self.vehicle.capacity_kg > 0:
            return (self.total_load_kg / self.vehicle.capacity_kg) * 100
        return 0.0


@dataclass
class RoutingMetrics:
    """Performance and quality metrics for a routing solution."""
    total_distance_m: float
    total_duration_minutes: float
    total_load_kg: float
    num_routes: int
    num_jobs_routed: int
    num_jobs_unassigned: int
    avg_utilization_pct: float
    computation_time_seconds: float
    strategy_used: OptimizationStrategy


@dataclass
class RoutingResult:
    """
    Complete output from the route optimizer.

    The dispatch module writes these back to DB:
        - routes → `routes` table
        - unassigned_jobs → flagged for manual assignment
        - metrics → logged for observability
    """
    routes: list[OptimizedRoute]
    unassigned_jobs: list[Job]                      # jobs that couldn't fit
    metrics: RoutingMetrics
    optimization_version: str = "1.0.0"
