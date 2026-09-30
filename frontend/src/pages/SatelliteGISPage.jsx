import { useMemo, useState } from "react";

const locations = {
  "Kanpur Industrial Zone": {
    region: "Kanpur, Uttar Pradesh",
    landChange: 12.4,
    vegetationChange: -6.7,
    waterChange: -8.2,
    hotspots: 14,
    builtUpChange: 9.8,
  },
  "Lucknow Urban Fringe": {
    region: "Lucknow, Uttar Pradesh",
    landChange: 8.7,
    vegetationChange: -4.2,
    waterChange: -3.8,
    hotspots: 9,
    builtUpChange: 11.6,
  },
  "Delhi NCR Periphery": {
    region: "Delhi NCR",
    landChange: 16.2,
    vegetationChange: -8.9,
    waterChange: -5.4,
    hotspots: 21,
    builtUpChange: 14.3,
  },
  "Bengaluru Growth Corridor": {
    region: "Bengaluru, Karnataka",
    landChange: 10.8,
    vegetationChange: -5.6,
    waterChange: -6.1,
    hotspots: 12,
    builtUpChange: 13.7,
  },
};

const timelineData = [
  {
    year: 2022,
    vegetation: 100,
    water: 100,
    builtUp: 100,
  },
  {
    year: 2023,
    vegetation: 97,
    water: 98,
    builtUp: 104,
  },
  {
    year: 2024,
    vegetation: 94,
    water: 96,
    builtUp: 108,
  },
  {
    year: 2025,
    vegetation: 91,
    water: 94,
    builtUp: 112,
  },
  {
    year: 2026,
    vegetation: 93.3,
    water: 91.8,
    builtUp: 118,
  },
];

const hotspotData = [
  {
    id: "GIS-001",
    type: "Land-surface change",
    location: "Industrial Zone A",
    confidence: "HIGH",
    status: "REQUIRES VERIFICATION",
  },
  {
    id: "GIS-002",
    type: "Vegetation change",
    location: "Northern Buffer",
    confidence: "MEDIUM",
    status: "OBSERVED CHANGE",
  },
  {
    id: "GIS-003",
    type: "Waste hotspot",
    location: "Recovery Corridor",
    confidence: "MEDIUM",
    status: "REQUIRES VERIFICATION",
  },
  {
    id: "GIS-004",
    type: "Water-area change",
    location: "Eastern Basin",
    confidence: "HIGH",
    status: "OBSERVED CHANGE",
  },
];

function SatelliteGISPage() {
  const [location, setLocation] = useState(
    "Kanpur Industrial Zone"
  );

  const [layer, setLayer] = useState("Environmental Change");

  const [dateFrom, setDateFrom] = useState("2022");

  const [dateTo, setDateTo] = useState("2026");

  const [scanComplete, setScanComplete] = useState(false);

  const [selectedHotspot, setSelectedHotspot] =
    useState(null);

  const [showBeforeAfter, setShowBeforeAfter] =
    useState(true);

  const [showHotspots, setShowHotspots] =
    useState(true);

  const currentLocation = locations[location];

  const mapHotspots = useMemo(
    () => [
      {
        id: "GIS-001",
        left: "24%",
        top: "36%",
        type: "Land change",
      },
      {
        id: "GIS-002",
        left: "47%",
        top: "24%",
        type: "Vegetation",
      },
      {
        id: "GIS-003",
        left: "61%",
        top: "62%",
        type: "Waste hotspot",
      },
      {
        id: "GIS-004",
        left: "77%",
        top: "42%",
        type: "Water change",
      },
      {
        id: "GIS-005",
        left: "38%",
        top: "70%",
        type: "Built-up expansion",
      },
    ],
    []
  );

  const handleScan = () => {
    setScanComplete(false);

    setTimeout(() => {
      setScanComplete(true);
    }, 700);
  };

  return (
    <div className="page satellite-gis-page">
      {/* PAGE HEADER */}

      <div className="page-header satellite-header">
        <div>
          <div className="eyebrow">
            REMOTE SENSING / GIS / ENVIRONMENTAL INTELLIGENCE
          </div>

          <h1>Satellite & GIS Change Monitor</h1>

          <p>
            Monitor environmental change across land,
            vegetation, water and waste-related hotspots
            using spatial intelligence.
          </p>
        </div>

        <div className="satellite-status">
          <span className="satellite-status-dot" />

          {scanComplete
            ? "ANALYSIS COMPLETE"
            : "SATELLITE MONITORING"}
        </div>
      </div>

      {/* FILTER BAR */}

      <section className="panel satellite-filter-panel">
        <div className="satellite-filter-grid">
          <div className="satellite-filter">
            <label>MONITORED REGION</label>

            <select
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            >
              {Object.keys(locations).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="satellite-filter">
            <label>GIS LAYER</label>

            <select
              value={layer}
              onChange={(event) =>
                setLayer(event.target.value)
              }
            >
              <option>Environmental Change</option>
              <option>Vegetation</option>
              <option>Water Bodies</option>
              <option>Built-up Area</option>
              <option>Waste Hotspots</option>
            </select>
          </div>

          <div className="satellite-filter">
            <label>BASELINE YEAR</label>

            <select
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(event.target.value)
              }
            >
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="satellite-filter">
            <label>MONITORING YEAR</label>

            <select
              value={dateTo}
              onChange={(event) =>
                setDateTo(event.target.value)
              }
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          <button
            type="button"
            className="satellite-scan-button"
            onClick={handleScan}
          >
            {scanComplete ? "RESCAN AREA" : "RUN CHANGE SCAN"}
          </button>
        </div>
      </section>

      {/* MAP + METRICS */}

      <div className="satellite-main-grid">
        <section className="panel satellite-map-panel">
          <div className="satellite-panel-header">
            <div>
              <div className="eyebrow">
                GIS ENVIRONMENTAL MAP
              </div>

              <h2>{currentLocation.region}</h2>
            </div>

            <div className="satellite-map-controls">
              <button
                type="button"
                className={
                  showHotspots
                    ? "map-toggle active"
                    : "map-toggle"
                }
                onClick={() =>
                  setShowHotspots((value) => !value)
                }
              >
                Hotspots
              </button>

              <button
                type="button"
                className={
                  showBeforeAfter
                    ? "map-toggle active"
                    : "map-toggle"
                }
                onClick={() =>
                  setShowBeforeAfter((value) => !value)
                }
              >
                Change Layer
              </button>
            </div>
          </div>

          <div className="satellite-map">
            <div className="satellite-map-grid" />

            <div className="map-terrain terrain-one" />
            <div className="map-terrain terrain-two" />
            <div className="map-terrain terrain-three" />

            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <div className="map-road road-three" />

            <div className="map-water-body">
              <span>WATER BODY</span>
            </div>

            <div className="map-industrial-zone">
              INDUSTRIAL ZONE
            </div>

            <div className="map-scale">
              <span />
              2 km
            </div>

            <div className="map-north">
              N
            </div>

            {showBeforeAfter &&
              mapHotspots.map((hotspot) => (
                <button
                  type="button"
                  key={hotspot.id}
                  className="map-hotspot"
                  style={{
                    left: hotspot.left,
                    top: hotspot.top,
                  }}
                  onClick={() =>
                    setSelectedHotspot(hotspot.id)
                  }
                  title={hotspot.type}
                >
                  <span />
                </button>
              ))}

            <div className="satellite-map-label label-north">
              MONITORING ZONE
            </div>

            <div className="satellite-map-footer">
              <span>
                SATELLITE BASELINE: {dateFrom}
              </span>

              <span>
                CURRENT: {dateTo}
              </span>

              <span>
                LAYER: {layer.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="satellite-map-legend">
            <div>
              <span className="legend-dot change" />
              Change detected
            </div>

            <div>
              <span className="legend-dot vegetation" />
              Vegetation
            </div>

            <div>
              <span className="legend-dot water" />
              Water body
            </div>

            <div>
              <span className="legend-dot hotspot" />
              Investigation hotspot
            </div>
          </div>
        </section>

        {/* METRICS */}

        <section className="satellite-metrics-column">
          <div className="satellite-metric-card">
            <span>LAND-SURFACE CHANGE</span>

            <strong>
              +{currentLocation.landChange}%
            </strong>

            <small>
              Compared with baseline
            </small>

            <div className="metric-bar">
              <span
                style={{
                  width: `${Math.min(
                    currentLocation.landChange * 4,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="satellite-metric-card">
            <span>VEGETATION CHANGE</span>

            <strong className="negative-metric">
              {currentLocation.vegetationChange}%
            </strong>

            <small>
              Modelled vegetation-index change
            </small>

            <div className="metric-bar">
              <span
                style={{
                  width: `${Math.abs(
                    currentLocation.vegetationChange
                  ) * 7}%`,
                }}
              />
            </div>
          </div>

          <div className="satellite-metric-card">
            <span>WATER-AREA CHANGE</span>

            <strong className="negative-metric">
              {currentLocation.waterChange}%
            </strong>

            <small>
              Detected surface-area difference
            </small>

            <div className="metric-bar">
              <span
                style={{
                  width: `${Math.abs(
                    currentLocation.waterChange
                  ) * 6}%`,
                }}
              />
            </div>
          </div>

          <div className="satellite-metric-card">
            <span>DETECTED HOTSPOTS</span>

            <strong>
              {currentLocation.hotspots}
            </strong>

            <small>
              Locations requiring review
            </small>

            <div className="hotspot-count">
              <span />
              Spatial monitoring active
            </div>
          </div>

          <div className="satellite-metric-card">
            <span>BUILT-UP EXPANSION</span>

            <strong>
              +{currentLocation.builtUpChange}%
            </strong>

            <small>
              Change from baseline
            </small>
          </div>
        </section>
      </div>

      {/* BEFORE / AFTER */}

      <section className="panel satellite-comparison-panel">
        <div className="satellite-panel-header">
          <div>
            <div className="eyebrow">
              TEMPORAL CHANGE DETECTION
            </div>

            <h2>
              {dateFrom} → {dateTo}
            </h2>

            <p>
              Compare the monitored landscape across
              two observation periods.
            </p>
          </div>

          <div className="comparison-badge">
            CHANGE ANALYSIS
          </div>
        </div>

        <div className="before-after-grid">
          <div className="satellite-image-card">
            <div className="image-card-label">
              <span>BASELINE</span>

              <strong>{dateFrom}</strong>
            </div>

            <div className="mock-satellite-image baseline-image">
              <div className="satellite-grid-lines" />

              <div className="satellite-forest forest-one" />
              <div className="satellite-forest forest-two" />
              <div className="satellite-water" />
              <div className="satellite-built built-one" />
              <div className="satellite-built built-two" />
            </div>

            <p>
              Baseline environmental conditions
            </p>
          </div>

          <div className="comparison-divider">
            →
          </div>

          <div className="satellite-image-card">
            <div className="image-card-label">
              <span>CURRENT OBSERVATION</span>

              <strong>{dateTo}</strong>
            </div>

            <div className="mock-satellite-image current-image">
              <div className="satellite-grid-lines" />

              <div className="satellite-forest forest-one" />
              <div className="satellite-forest forest-two" />
              <div className="satellite-water water-reduced" />
              <div className="satellite-built built-one" />
              <div className="satellite-built built-two expanded" />

              <div className="change-overlay">
                CHANGE
              </div>
            </div>

            <p>
              Detected spatial differences
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}

      <section className="panel satellite-timeline-panel">
        <div className="satellite-panel-header">
          <div>
            <div className="eyebrow">
              ENVIRONMENTAL CHANGE TIMELINE
            </div>

            <h2>Landscape indicators</h2>
          </div>
        </div>

        <div className="satellite-timeline">
          {timelineData.map((item, index) => (
            <div
              className="timeline-year"
              key={item.year}
            >
              <div className="timeline-year-label">
                {item.year}
              </div>

              <div className="timeline-node">
                <span />
              </div>

              <div className="timeline-indicators">
                <div>
                  <span>VEG</span>

                  <strong>
                    {item.vegetation}%
                  </strong>
                </div>

                <div>
                  <span>WATER</span>

                  <strong>
                    {item.water}%
                  </strong>
                </div>

                <div>
                  <span>BUILT</span>

                  <strong>
                    {item.builtUp}%
                  </strong>
                </div>
              </div>

              {index < timelineData.length - 1 && (
                <div className="timeline-connector" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* HOTSPOT REGISTER */}

      <section className="panel satellite-hotspot-panel">
        <div className="satellite-panel-header">
          <div>
            <div className="eyebrow">
              CHANGE DETECTION REGISTER
            </div>

            <h2>Environmental change flags</h2>

            <p>
              Spatial observations that may require
              additional verification.
            </p>
          </div>

          <div className="hotspot-register-count">
            {hotspotData.length} FLAGS
          </div>
        </div>

        <div className="satellite-hotspot-table">
          <div className="hotspot-table-header">
            <span>ID</span>
            <span>CHANGE TYPE</span>
            <span>LOCATION</span>
            <span>CONFIDENCE</span>
            <span>STATUS</span>
          </div>

          {hotspotData.map((item) => (
            <button
              type="button"
              className={
                selectedHotspot === item.id
                  ? "hotspot-row selected"
                  : "hotspot-row"
              }
              key={item.id}
              onClick={() =>
                setSelectedHotspot(item.id)
              }
            >
              <span>{item.id}</span>

              <strong>{item.type}</strong>

              <span>{item.location}</span>

              <span>
                <b
                  className={`confidence-badge ${item.confidence.toLowerCase()}`}
                >
                  {item.confidence}
                </b>
              </span>

              <span>
                <b className="verification-badge">
                  {item.status}
                </b>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ECOVERSE CONNECTION */}

      <section className="satellite-connection-section">
        <div>
          <div className="eyebrow">
            ECOVERSE INTELLIGENCE CONNECTION
          </div>

          <h2>
            Connect spatial change with environmental
            evidence.
          </h2>

          <p>
            Satellite observations can be combined with
            product lifecycle data, waste manifests,
            community reports and environmental impact
            indicators to create a broader evidence chain.
          </p>
        </div>

        <div className="satellite-connection-grid">
          <div>
            <span>01</span>
            <strong>Waste Manifests</strong>
            <p>
              Compare monitored areas with recorded
              waste movement.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Community Reports</strong>
            <p>
              Cross-reference spatial observations with
              user-submitted reports.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>Carbon & Methane</strong>
            <p>
              Connect environmental changes with
              modelled climate indicators.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>Product Trace</strong>
            <p>
              Link environmental observations with
              product and supply-chain context.
            </p>
          </div>
        </div>
      </section>

      {/* DATA NOTE */}

      <div className="satellite-data-note">
        <div className="satellite-note-icon">
          GIS
        </div>

        <div>
          <strong>
            Spatial intelligence demonstration
          </strong>

          <p>
            This frontend currently uses simulated
            satellite/GIS observations for demonstration.
            Values are not live satellite measurements.
            Production deployment should connect verified
            remote-sensing datasets, GIS services,
            geospatial coordinates and documented change
            detection methodology.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SatelliteGISPage;