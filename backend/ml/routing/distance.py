"""
Distance matrix computation for route optimization.

Provides:
    - HaversineDistanceProvider: fast, offline, straight-line distances (good for dev/testing)
    - OSRMDistanceProvider:      real road-network distances via OSRM API (open-source)
    - MapAPIDistanceProvider:    Google Maps / Mapbox distance matrix API (production)

The optimizer depends only on the abstract DistanceProvider interface,
so providers can be swapped without changing routing logic.
"""

from __future__ import annotations

import math
from abc import ABC, abstractmethod
from dataclasses import dataclass

import numpy as np

from ml.routing.models import Location


# ---------------------------------------------------------------------------
# Abstract interface
# ---------------------------------------------------------------------------

class DistanceProvider(ABC):
    """
    Abstract interface for computing distances between locations.

    Implementations must return a distance matrix (meters) and optionally
    a duration matrix (seconds). The optimizer uses these for cost computation.
    """

    @abstractmethod
    def compute_distance_matrix(
        self, locations: list[Location]
    ) -> DistanceMatrix:
        """
        Compute pairwise distances between all locations.

        Args:
            locations: list of N locations (index 0 is typically the depot)

        Returns:
            DistanceMatrix with NxN distance and duration arrays
        """
        ...


@dataclass
class DistanceMatrix:
    """NxN matrix of distances (meters) and durations (seconds) between locations."""
    distances_m: np.ndarray      # shape (N, N), dtype float64
    durations_s: np.ndarray      # shape (N, N), dtype float64
    locations: list[Location]    # the locations in matrix order

    @property
    def size(self) -> int:
        return len(self.locations)

    def distance(self, from_idx: int, to_idx: int) -> float:
        """Distance in meters from location[from_idx] to location[to_idx]."""
        return float(self.distances_m[from_idx, to_idx])

    def duration(self, from_idx: int, to_idx: int) -> float:
        """Duration in seconds from location[from_idx] to location[to_idx]."""
        return float(self.durations_s[from_idx, to_idx])


# ---------------------------------------------------------------------------
# Haversine (offline, straight-line)
# ---------------------------------------------------------------------------

EARTH_RADIUS_M = 6_371_000  # meters


def _haversine(loc1: Location, loc2: Location) -> float:
    """
    Great-circle distance between two points on Earth in meters.
    Fast and dependency-free — used for dev/testing and as a fallback.
    """
    lat1, lng1 = math.radians(loc1.lat), math.radians(loc1.lng)
    lat2, lng2 = math.radians(loc2.lat), math.radians(loc2.lng)

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS_M * c


class HaversineDistanceProvider(DistanceProvider):
    """
    Straight-line distance using the Haversine formula.

    Good for:
        - Development and testing (no API keys needed)
        - Fallback when external APIs are down (graceful degradation)
        - Initial prototyping

    Limitations:
        - Does not account for roads, one-way streets, traffic
        - Underestimates real driving distance by 20-40% typically

    A scaling factor can be applied to approximate road distance:
        road_distance ≈ haversine_distance × detour_factor
    """

    def __init__(self, detour_factor: float = 1.3):
        """
        Args:
            detour_factor: multiplier to approximate road distance from
                           straight-line distance. 1.3 is a reasonable
                           urban default (roads are ~30% longer than
                           straight line on average).
        """
        if detour_factor < 1.0:
            raise ValueError("detour_factor must be >= 1.0")
        self.detour_factor = detour_factor

    def compute_distance_matrix(
        self, locations: list[Location]
    ) -> DistanceMatrix:
        n = len(locations)
        distances = np.zeros((n, n), dtype=np.float64)
        durations = np.zeros((n, n), dtype=np.float64)

        # Average urban speed assumption: 25 km/h = ~6.94 m/s
        avg_speed_ms = 6.94

        for i in range(n):
            for j in range(i + 1, n):
                d = _haversine(locations[i], locations[j]) * self.detour_factor
                distances[i, j] = d
                distances[j, i] = d
                t = d / avg_speed_ms
                durations[i, j] = t
                durations[j, i] = t

        return DistanceMatrix(
            distances_m=distances,
            durations_s=durations,
            locations=locations,
        )


# ---------------------------------------------------------------------------
# OSRM (open-source road-network routing)
# ---------------------------------------------------------------------------

class OSRMDistanceProvider(DistanceProvider):
    """
    Road-network distances via OSRM (Open Source Routing Machine).

    OSRM can be self-hosted for free using OpenStreetMap data.
    See: https://project-osrm.org/

    Requires:
        - httpx (async HTTP client)
        - A running OSRM instance (Docker: osrm/osrm-backend)

    For local dev:
        docker run -t -i -p 5000:5000 osrm/osrm-backend:latest
    """

    def __init__(
        self,
        base_url: str = "http://localhost:5000",
        profile: str = "driving",
    ):
        self.base_url = base_url.rstrip("/")
        self.profile = profile

    def compute_distance_matrix(
        self, locations: list[Location]
    ) -> DistanceMatrix:
        import httpx

        # OSRM table API: /table/v1/{profile}/{coords}
        coords = ";".join(f"{loc.lng},{loc.lat}" for loc in locations)
        url = f"{self.base_url}/table/v1/{self.profile}/{coords}"
        params = {"annotations": "distance,duration"}

        response = httpx.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()

        if data.get("code") != "Ok":
            raise RuntimeError(
                f"OSRM table API error: {data.get('code')} — {data.get('message', '')}"
            )

        distances = np.array(data["distances"], dtype=np.float64)
        durations = np.array(data["durations"], dtype=np.float64)

        return DistanceMatrix(
            distances_m=distances,
            durations_s=durations,
            locations=locations,
        )


# ---------------------------------------------------------------------------
# Google Maps / Mapbox distance matrix (production)
# ---------------------------------------------------------------------------

class MapAPIDistanceProvider(DistanceProvider):
    """
    Distance matrix via Google Maps or Mapbox API.

    This is behind the adapter pattern mandated by architecture.md:
        "External providers are behind adapters."

    Usage:
        provider = MapAPIDistanceProvider(
            api_key="...",
            provider="google",  # or "mapbox"
        )

    Note: Google Maps Distance Matrix API has a limit of 25 origins × 25
    destinations per request. For larger matrices, this implementation
    chunks the requests automatically.
    """

    MAX_ELEMENTS_PER_REQUEST = 25  # Google Maps limit

    def __init__(
        self,
        api_key: str,
        provider: str = "google",
        base_url: str | None = None,
    ):
        self.api_key = api_key
        self.provider = provider.lower()

        if base_url:
            self.base_url = base_url
        elif self.provider == "google":
            self.base_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        elif self.provider == "mapbox":
            self.base_url = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving"
        else:
            raise ValueError(f"Unknown map provider: {provider}")

    def compute_distance_matrix(
        self, locations: list[Location]
    ) -> DistanceMatrix:
        n = len(locations)

        if self.provider == "google":
            return self._compute_google(locations, n)
        elif self.provider == "mapbox":
            return self._compute_mapbox(locations, n)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    def _compute_google(
        self, locations: list[Location], n: int
    ) -> DistanceMatrix:
        import httpx

        distances = np.zeros((n, n), dtype=np.float64)
        durations = np.zeros((n, n), dtype=np.float64)

        # Chunk origins to stay within API limits
        chunk_size = self.MAX_ELEMENTS_PER_REQUEST

        for origin_start in range(0, n, chunk_size):
            origin_end = min(origin_start + chunk_size, n)
            origins = "|".join(
                f"{locations[i].lat},{locations[i].lng}"
                for i in range(origin_start, origin_end)
            )

            for dest_start in range(0, n, chunk_size):
                dest_end = min(dest_start + chunk_size, n)
                destinations = "|".join(
                    f"{locations[j].lat},{locations[j].lng}"
                    for j in range(dest_start, dest_end)
                )

                params = {
                    "origins": origins,
                    "destinations": destinations,
                    "key": self.api_key,
                    "mode": "driving",
                }

                resp = httpx.get(self.base_url, params=params, timeout=30.0)
                resp.raise_for_status()
                data = resp.json()

                if data["status"] != "OK":
                    raise RuntimeError(f"Google Maps API error: {data['status']}")

                for i, row in enumerate(data["rows"]):
                    for j, element in enumerate(row["elements"]):
                        if element["status"] == "OK":
                            oi = origin_start + i
                            dj = dest_start + j
                            distances[oi, dj] = element["distance"]["value"]
                            durations[oi, dj] = element["duration"]["value"]

        return DistanceMatrix(
            distances_m=distances,
            durations_s=durations,
            locations=locations,
        )

    def _compute_mapbox(
        self, locations: list[Location], n: int
    ) -> DistanceMatrix:
        import httpx

        # Mapbox matrix API: max 25 coordinates
        if n > self.MAX_ELEMENTS_PER_REQUEST:
            raise ValueError(
                f"Mapbox matrix API supports max {self.MAX_ELEMENTS_PER_REQUEST} "
                f"coordinates, got {n}. Use chunking or switch to OSRM."
            )

        coords = ";".join(f"{loc.lng},{loc.lat}" for loc in locations)
        url = f"{self.base_url}/{coords}"
        params = {
            "access_token": self.api_key,
            "annotations": "distance,duration",
        }

        resp = httpx.get(url, params=params, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") != "Ok":
            raise RuntimeError(f"Mapbox API error: {data.get('code')}")

        distances = np.array(data["distances"], dtype=np.float64)
        durations = np.array(data["durations"], dtype=np.float64)

        return DistanceMatrix(
            distances_m=distances,
            durations_s=durations,
            locations=locations,
        )
