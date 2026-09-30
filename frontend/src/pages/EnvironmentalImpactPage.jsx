import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../styles/environmental-impact.css";

const pickup = [26.8467, 80.9462];
const current = [26.65, 80.75];
const destination = [26.4499, 80.3319];

const route = [
  pickup,
  [26.78, 80.86],
  [26.70, 80.80],
  current,
  [26.55, 80.55],
  destination,
];

function EnvironmentalImpactPage() {
  return (
    <div className="page environmental-impact-page">
      {/* HEADER */}
      <header className="impact-header">
        <div>
          <span className="impact-eyebrow">ENVIRONMENTAL INTELLIGENCE</span>

          <h1>Environmental Impact</h1>

          <p>
            Measure the environmental consequences of materials, waste,
            transportation and treatment across the product lifecycle.
          </p>
        </div>

        <div className="impact-header-status">
          <span></span>
          LIVE MONITORING
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <section className="impact-summary-grid">
        <div className="impact-stat-card waste-card">
          <div className="impact-stat-icon">♻</div>
          <div>
            <span>Waste Generated</span>
            <strong>2,840 kg</strong>
            <small>Across tracked manifests</small>
          </div>
        </div>

        <div className="impact-stat-card water-card">
          <div className="impact-stat-icon">◈</div>
          <div>
            <span>Water Footprint</span>
            <strong>18,420 L</strong>
            <small>Estimated resource usage</small>
          </div>
        </div>

        <div className="impact-stat-card energy-card">
          <div className="impact-stat-icon">ϟ</div>
          <div>
            <span>Energy Used</span>
            <strong>6,840 kWh</strong>
            <small>Production + transport</small>
          </div>
        </div>

        <div className="impact-stat-card carbon-card">
          <div className="impact-stat-icon">CO₂</div>
          <div>
            <span>GHG Emissions</span>
            <strong>4.82 t</strong>
            <small>CO₂ equivalent</small>
          </div>
        </div>
      </section>

      {/* IMPACT OVERVIEW */}
      <section className="impact-overview">
        <div className="impact-section-heading">
          <div>
            <span className="impact-eyebrow">IMPACT SIGNALS</span>
            <h2>Environmental Footprint Overview</h2>
          </div>

          <span className="impact-period">2026 · Current Data</span>
        </div>

        <div className="impact-metrics-grid">
          <div className="impact-metric">
            <div className="metric-top">
              <span>Material Consumption</span>
              <b>68%</b>
            </div>

            <div className="metric-bar">
              <span className="material-progress"></span>
            </div>

            <p>Virgin material remains the dominant input.</p>
          </div>

          <div className="impact-metric">
            <div className="metric-top">
              <span>Landfill Diversion</span>
              <b>74%</b>
            </div>

            <div className="metric-bar">
              <span className="diversion-progress"></span>
            </div>

            <p>Waste redirected toward recovery pathways.</p>
          </div>

          <div className="impact-metric">
            <div className="metric-top">
              <span>Recycled Content</span>
              <b>42%</b>
            </div>

            <div className="metric-bar">
              <span className="recycled-progress"></span>
            </div>

            <p>Tracked products containing recycled material.</p>
          </div>
        </div>
      </section>

      {/* IMPACT BREAKDOWN */}
      <section className="impact-breakdown-grid">
        <div className="impact-breakdown-card">
          <div className="breakdown-header">
            <div>
              <span className="impact-eyebrow">RESOURCE PROFILE</span>
              <h2>Resource Consumption</h2>
            </div>

            <span className="breakdown-tag">MODELLED</span>
          </div>

          <div className="resource-list">
            <div className="resource-row">
              <div>
                <span className="resource-dot water"></span>
                Water
              </div>
              <strong>18,420 L</strong>
            </div>

            <div className="resource-row">
              <div>
                <span className="resource-dot energy"></span>
                Energy
              </div>
              <strong>6,840 kWh</strong>
            </div>

            <div className="resource-row">
              <div>
                <span className="resource-dot material"></span>
                Raw Material
              </div>
              <strong>4.6 t</strong>
            </div>

            <div className="resource-row">
              <div>
                <span className="resource-dot fuel"></span>
                Transport Fuel
              </div>
              <strong>1,240 L</strong>
            </div>
          </div>
        </div>

        <div className="impact-breakdown-card">
          <div className="breakdown-header">
            <div>
              <span className="impact-eyebrow">WASTE OUTCOME</span>
              <h2>End-of-Life Distribution</h2>
            </div>

            <span className="breakdown-tag verified">VERIFIED</span>
          </div>

          <div className="outcome-list">
            <div className="outcome-row">
              <span>Recycled</span>
              <strong>48%</strong>
            </div>

            <div className="outcome-row">
              <span>Reused</span>
              <strong>26%</strong>
            </div>

            <div className="outcome-row">
              <span>Recovered</span>
              <strong>12%</strong>
            </div>

            <div className="outcome-row">
              <span>Landfill</span>
              <strong>14%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="impact-map-section">
        <div className="impact-section-heading">
          <div>
            <span className="impact-eyebrow">TRACEABILITY ROUTE</span>
            <h2>Environmental Transport Trace</h2>
            <p>
              Follow the waste manifest from generation to treatment and
              recovery.
            </p>
          </div>

          <span className="impact-manifest">WM-2026-00204</span>
        </div>

        <div className="environmental-map">
          <MapContainer
            center={current}
            zoom={9}
            className="environmental-leaflet-map"
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={route}
              pathOptions={{
                color: "#0f766e",
                weight: 5,
              }}
            />

            <Marker position={pickup}>
              <Popup>
                <strong>Pickup Location</strong>
                <br />
                Waste generated here.
              </Popup>
            </Marker>

            <Marker position={current}>
              <Popup>
                <strong>🚛 Waste Transporter</strong>
                <br />
                Manifest: WM-2026-00204
                <br />
                Status: IN TRANSIT
              </Popup>
            </Marker>

            <Marker position={destination}>
              <Popup>
                <strong>Destination Facility</strong>
                <br />
                Waste treatment and recovery.
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="impact-map-legend">
          <span>
            <i className="legend-pickup"></i>
            Pickup
          </span>

          <span>
            <i className="legend-transit"></i>
            In Transit
          </span>

          <span>
            <i className="legend-destination"></i>
            Treatment Facility
          </span>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="impact-methodology">
        <span className="impact-eyebrow">DATA QUALITY</span>

        <h2>Measurement & Methodology</h2>

        <p>
          Environmental indicators combine verified records, company-reported
          information and clearly labelled modelled estimates.
        </p>

        <div className="methodology-grid">
          <div>
            <span>01</span>
            <strong>Input</strong>
            <p>Material, energy, water and waste records.</p>
          </div>

          <div>
            <span>02</span>
            <strong>Method</strong>
            <p>Lifecycle impact calculations and conversion factors.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Source</strong>
            <p>Company, operator and external datasets.</p>
          </div>

          <div>
            <span>04</span>
            <strong>Uncertainty</strong>
            <p>Estimates are explicitly marked when data is incomplete.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EnvironmentalImpactPage;