import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/route/route.css";

// Fix Leaflet default icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const BACKEND = "https://spectrum-hackathon.onrender.com/api/v1";

// Kanpur, UP — real coordinates for the demo pickups
const DEPOT     = { id: "depot",  lat: 26.4499, lng: 80.3319, label: "Depot — Central Facility" };
const DEST      = { id: "dest",   lat: 26.5124, lng: 80.2329, label: "Recovery Facility — Panki Industrial" };
const ALL_PICKUPS = [
  { id: "PR-2026-1042", lat: 26.4820, lng: 80.3490, label: "Textile — Civil Lines",   weight_kg: 85,  priority: "HIGH"   },
  { id: "PR-2026-1043", lat: 26.4973, lng: 80.3104, label: "Plastic — Swaroop Nagar", weight_kg: 120, priority: "MEDIUM" },
  { id: "PR-2026-1044", lat: 26.4341, lng: 80.2680, label: "E-waste — Kalyanpur",     weight_kg: 45,  priority: "HIGH"   },
  { id: "PR-2026-1045", lat: 26.4720, lng: 80.3720, label: "Cardboard — Kidwai Nagar",weight_kg: 90,  priority: "LOW"    },
  { id: "PR-2026-1046", lat: 26.4560, lng: 80.2610, label: "Metal — Panki",           weight_kg: 75,  priority: "MEDIUM" },
  { id: "PR-2026-1047", lat: 26.4635, lng: 80.3012, label: "Glass — Arya Nagar",      weight_kg: 60,  priority: "LOW"    },
];

const PRIORITY_COLOR = { HIGH: "#e74c3c", MEDIUM: "#f39c12", LOW: "#27ae60" };

function makeIcon(color, label) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function RouteOptimizationPage() {
  const [selectedIds, setSelectedIds] = useState(["PR-2026-1042", "PR-2026-1043", "PR-2026-1044", "PR-2026-1045"]);
  const [optimizing, setOptimizing] = useState(false);
  const [route, setRoute] = useState(null);   // RouteOptimizeResponse
  const [error, setError] = useState("");

  const selectedPickups = ALL_PICKUPS.filter(p => selectedIds.includes(p.id));
  const totalWeight = selectedPickups.reduce((s, p) => s + p.weight_kg, 0);

  function togglePickup(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setRoute(null);
  }

  async function runOptimization() {
    if (selectedPickups.length === 0) return;
    setOptimizing(true);
    setError("");
    setRoute(null);

    try {
      const token = localStorage.getItem("ecoverseToken");
      const res = await fetch(`${BACKEND}/dispatch/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          depot: DEPOT,
          pickups: selectedPickups,
          destination: DEST,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      setRoute(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setOptimizing(false);
    }
  }

  // Build polyline path: depot → ordered stops (already includes dest at end)
  const polylinePositions = route
    ? route.stops.map(s => [s.lat, s.lng])
    : [[DEPOT.lat, DEPOT.lng], ...selectedPickups.map(p => [p.lat, p.lng]), [DEST.lat, DEST.lng]];

  const allPositions = [[DEPOT.lat, DEPOT.lng], ...ALL_PICKUPS.map(p => [p.lat, p.lng]), [DEST.lat, DEST.lng]];

  return (
    <div className="page route-optimization-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">OPERATIONS / ROUTE OPTIMIZATION</div>
          <h1>Route Optimization</h1>
          <p>Select pickup requests, run the Nearest-Neighbour + 2-opt algorithm, and see the optimal collection route on a real map.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ fontSize: 12, color: "#718078" }}>{selectedPickups.length} stops · {totalWeight} kg</div>
          <button
            onClick={runOptimization}
            disabled={optimizing || selectedPickups.length === 0}
            style={{
              padding: "12px 28px",
              background: optimizing ? "#ccc" : "var(--land-green, #1a3a28)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: optimizing ? "not-allowed" : "pointer",
            }}
          >
            {optimizing ? "Optimizing…" : "▶  Optimize Route"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#c0392b" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT — PICKUP LIST */}
        <section className="panel" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>SELECT PICKUPS</div>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Pending Requests</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ALL_PICKUPS.map(p => {
              const sel = selectedIds.includes(p.id);
              const routeStop = route?.stops.find(s => s.id === p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePickup(p.id)}
                  style={{
                    border: `2px solid ${sel ? PRIORITY_COLOR[p.priority] : "#e0e0e0"}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    cursor: "pointer",
                    background: sel ? "#f8fffe" : "#fafafa",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.label.split("—")[0].trim()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[p.priority], background: `${PRIORITY_COLOR[p.priority]}18`, padding: "2px 8px", borderRadius: 20 }}>{p.priority}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#718078", marginTop: 4 }}>{p.label.split("—")[1]?.trim()} · {p.weight_kg} kg</div>
                  {routeStop && (
                    <div style={{ fontSize: 11, marginTop: 6, color: "#1a3a28", fontWeight: 600 }}>
                      Stop #{routeStop.order} · +{routeStop.distance_from_prev_km} km from prev
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT — REAL LEAFLET MAP */}
        <section className="panel" style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
          <MapContainer
            center={[26.4499, 80.3319]}
            zoom={12}
            style={{ height: 560, width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <FitBounds positions={allPositions} />

            {/* Route polyline — red dashed before optimize, solid green after */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: route ? "#1a3a28" : "#aaa",
                weight: route ? 4 : 2,
                dashArray: route ? null : "8 6",
                opacity: 0.85,
              }}
            />

            {/* DEPOT */}
            <Marker position={[DEPOT.lat, DEPOT.lng]} icon={makeIcon("#3498db", "D")}>
              <Popup><strong>DEPOT</strong><br />{DEPOT.label}</Popup>
            </Marker>

            {/* DESTINATION */}
            <Marker position={[DEST.lat, DEST.lng]} icon={makeIcon("#8e44ad", "R")}>
              <Popup><strong>RECOVERY FACILITY</strong><br />{DEST.label}</Popup>
            </Marker>

            {/* PICKUP MARKERS */}
            {ALL_PICKUPS.map(p => {
              const sel = selectedIds.includes(p.id);
              const stopNum = route?.stops.find(s => s.id === p.id)?.order;
              const label = route && stopNum !== undefined ? String(stopNum) : sel ? "P" : "·";
              return (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={makeIcon(sel ? PRIORITY_COLOR[p.priority] : "#bbb", label)}
                  opacity={sel ? 1 : 0.5}
                >
                  <Popup>
                    <strong>{p.label}</strong><br />
                    {p.weight_kg} kg · Priority: {p.priority}
                    {route && stopNum !== undefined && (
                      <><br /><em>Stop #{stopNum}</em></>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* MAP LEGEND */}
          <div style={{ display: "flex", gap: 20, padding: "12px 20px", fontSize: 12, color: "#718078", borderTop: "1px solid #eee", flexWrap: "wrap" }}>
            <span>🔵 Depot</span>
            <span>🟠 High priority</span>
            <span>🟡 Medium priority</span>
            <span>🟢 Low priority</span>
            <span>🟣 Recovery facility</span>
            {route && <span style={{ color: "#1a3a28", fontWeight: 700 }}>Total: {route.total_distance_km} km · {selectedPickups.length} stops</span>}
          </div>
        </section>
      </div>

      {/* OPTIMIZED SEQUENCE */}
      {route && (
        <section className="panel" style={{ marginTop: 20, padding: 24 }}>
          <div className="eyebrow">ALGORITHM OUTPUT</div>
          <h2 style={{ marginBottom: 4 }}>Optimized Stop Sequence <span style={{ color: "#718078", fontWeight: 400, fontSize: 14 }}>(Nearest-Neighbour + 2-opt)</span></h2>
          <p style={{ color: "#718078", marginBottom: 20 }}>Total route distance: <strong>{route.total_distance_km} km</strong> · Computed in &lt;1 second</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {route.stops.map((stop, i) => (
              <div key={stop.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span style={{ color: "#aaa", fontSize: 18 }}>→</span>}
                <div style={{
                  background: stop.id === "depot" ? "#3498db" : stop.id === "dest" ? "#8e44ad" : "#1a3a28",
                  color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
                }}>
                  {stop.label.split("—")[0].trim()}
                  <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>+{stop.distance_from_prev_km} km</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}