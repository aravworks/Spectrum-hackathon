from typing import Any, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.schemas.dispatch import DispatchRunResponse
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.dispatch_service import DispatchService

router = APIRouter()


class RoutePoint(BaseModel):
    id: str
    lat: float
    lng: float
    label: str
    weight_kg: float = 0.0


class RouteOptimizeRequest(BaseModel):
    depot: RoutePoint
    pickups: List[RoutePoint]
    destination: RoutePoint


class RouteOptimizeResponse(BaseModel):
    ordered_ids: List[str]          # optimized visit order
    total_distance_km: float
    stops: List[dict]               # [{id, lat, lng, label, order, distance_from_prev_km}]


@router.post("/optimize", response_model=RouteOptimizeResponse)
def optimize_route(
    request: RouteOptimizeRequest,
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> Any:
    """
    Accepts a depot, list of pickup points and a final destination.
    Runs the Nearest-Neighbour + 2-opt algorithm on the Haversine distance
    matrix and returns the optimised visit order with per-stop distances.
    No API keys required — pure math.
    """
    import math

    def haversine(lat1, lng1, lat2, lng2) -> float:
        """Returns distance in metres."""
        R = 6_371_000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lng2 - lng1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
        return 2 * R * math.asin(math.sqrt(a))

    # Build index list: [depot, p0, p1, ..., pN]
    all_points = [request.depot] + request.pickups   # exclude destination from NN — it's always last
    n = len(all_points)

    # Build full distance matrix (metres)
    dist = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dist[i][j] = haversine(
                    all_points[i].lat, all_points[i].lng,
                    all_points[j].lat, all_points[j].lng,
                )

    # ── Nearest-Neighbour from depot (index 0) ──────────────────────────
    visited = [False] * n
    visited[0] = True
    route = [0]

    while len(route) < n:
        current = route[-1]
        nearest = -1
        nearest_dist = float("inf")
        for j in range(n):
            if not visited[j] and dist[current][j] < nearest_dist:
                nearest = j
                nearest_dist = dist[current][j]
        visited[nearest] = True
        route.append(nearest)

    # ── 2-opt improvement ───────────────────────────────────────────────
    def total_route_dist(r):
        return sum(dist[r[i]][r[i + 1]] for i in range(len(r) - 1))

    improved = True
    while improved:
        improved = False
        for i in range(1, len(route) - 1):
            for j in range(i + 1, len(route)):
                new_route = route[:i] + route[i:j + 1][::-1] + route[j + 1:]
                if total_route_dist(new_route) < total_route_dist(route) - 1.0:
                    route = new_route
                    improved = True

    # ── Build response ───────────────────────────────────────────────────
    stops = []
    total_dist_m = 0.0
    prev_lat, prev_lng = request.depot.lat, request.depot.lng

    ordered_ids = []
    for order_idx, pt_idx in enumerate(route):
        pt = all_points[pt_idx]
        d = haversine(prev_lat, prev_lng, pt.lat, pt.lng)
        total_dist_m += d
        prev_lat, prev_lng = pt.lat, pt.lng

        ordered_ids.append(pt.id)
        stops.append({
            "id": pt.id,
            "lat": pt.lat,
            "lng": pt.lng,
            "label": pt.label,
            "order": order_idx,
            "distance_from_prev_km": round(d / 1000, 2),
        })

    # Add final leg to destination
    dest = request.destination
    d_final = haversine(prev_lat, prev_lng, dest.lat, dest.lng)
    total_dist_m += d_final
    stops.append({
        "id": dest.id,
        "lat": dest.lat,
        "lng": dest.lng,
        "label": dest.label,
        "order": len(stops),
        "distance_from_prev_km": round(d_final / 1000, 2),
    })
    ordered_ids.append(dest.id)

    return RouteOptimizeResponse(
        ordered_ids=ordered_ids,
        total_distance_km=round(total_dist_m / 1000, 2),
        stops=stops,
    )


@router.post("/run", response_model=DispatchRunResponse)
def run_dispatch_optimization(
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Triggers the ML Route Optimizer against the DB pending pickups.
    Restricted to CITY_ADMIN and SYS_ADMIN.
    """
    result = DispatchService.run_optimization()
    return result
