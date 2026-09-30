import { useMemo, useState } from "react";
import EnvironmentalMap from "../components/EnvironmentalMap";
import "../styles/manifest/manifest.css";

const initialManifests = [
  {
    id: "WM-2026-00184",
    category: "Textile Waste",
    generator: "Demo Apparel",
    quantity: 184,
    transporter: "GreenRoute Logistics",
    destination: "Tiruppur Textile Recovery",
    pickupDate: "24 Sep 2026",
    received: 176,
    treatment: "Fiber Recovery",
    outcome: "Material Recovered",
    status: "COMPLETED",
  },
  {
    id: "WM-2026-00191",
    category: "PET Plastic",
    generator: "Demo Beverages",
    quantity: 420,
    transporter: "CircularMove",
    destination: "Pune Plastic Recovery",
    pickupDate: "26 Sep 2026",
    received: 420,
    treatment: "Mechanical Recycling",
    outcome: "Recycled Material",
    status: "COMPLETED",
  },
  {
    id: "WM-2026-00204",
    category: "Electronic Waste",
    generator: "Demo Electronics",
    quantity: 96,
    transporter: "E-Waste Transit",
    destination: "Certified E-Waste Facility",
    pickupDate: "28 Sep 2026",
    received: 91,
    treatment: "Component Recovery",
    outcome: "Investigation Required",
    status: "FLAGGED",
  },
  {
    id: "WM-2026-00217",
    category: "Mixed Packaging",
    generator: "Demo Foods",
    quantity: 310,
    transporter: "EcoTransit",
    destination: "Delhi Material Recovery",
    pickupDate: "29 Sep 2026",
    received: null,
    treatment: "Pending",
    outcome: "Awaiting Receipt",
    status: "IN TRANSIT",
  },
];

function WasteManifestPage() {
  const [manifests] = useState(initialManifests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedManifest, setSelectedManifest] =
    useState(null);

  const filteredManifests = useMemo(() => {
    return manifests.filter((manifest) => {
      const matchesSearch =
        manifest.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        manifest.category
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        manifest.generator
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        manifest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [manifests, search, statusFilter]);

  const totalQuantity = manifests.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const completed = manifests.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const flagged = manifests.filter(
    (item) => item.status === "FLAGGED"
  ).length;

  const inTransit = manifests.filter(
    (item) => item.status === "IN TRANSIT"
  ).length;

  const receivedQuantity = manifests.reduce(
    (sum, item) => sum + (item.received || 0),
    0
  );

  const traceability =
    totalQuantity > 0
      ? Math.round(
          (receivedQuantity / totalQuantity) * 100
        )
      : 0;

  return (
    <div className="page manifest-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            WASTE INTELLIGENCE
          </div>

          <h1>
            Waste Manifest
          </h1>

          <p>
            Follow waste from generation and pickup
            through transport, receipt, treatment
            and final outcome.
          </p>
        </div>

        <div className="manifest-header-status">
          <span className="status-dot" />
          Chain-of-custody monitoring
        </div>

      </div>

      {/* =========================
          KPI CARDS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Manifests</span>
          <strong>{manifests.length}</strong>
          <small>Tracked records</small>
        </div>

        <div className="stat-card">
          <span>Waste Generated</span>
          <strong>{totalQuantity} kg</strong>
          <small>Across tracked manifests</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
          <small>Received and processed</small>
        </div>

        <div className="stat-card">
          <span>Flagged</span>
          <strong>{flagged}</strong>
          <small>Require investigation</small>
        </div>

      </div>

      {/* =========================
          GPS TRACKING
      ========================= */}

      <section className="manifest-gps-section">

        <div className="section-heading">

          <div>
            <div className="eyebrow">
              LIVE TRANSPORT MONITORING
            </div>

            <h2>
              Waste Movement Tracking
            </h2>

            <p>
              Track the current movement of a waste
              shipment between pickup and destination.
            </p>
          </div>

          <div className="gps-demo-badge">
            SIMULATED GPS
          </div>

        </div>

        <EnvironmentalMap
          manifestId="WM-2026-00204"
          autoTrack={true}
        />

      </section>

      {/* =========================
          CHAIN SUMMARY
      ========================= */}

      <section className="manifest-summary">

        <div className="manifest-summary-card">

          <span>
            GENERATED
          </span>

          <strong>
            {totalQuantity} kg
          </strong>

          <small>
            Waste recorded at source
          </small>

        </div>

        <div className="manifest-summary-line" />

        <div className="manifest-summary-card">

          <span>
            RECEIVED
          </span>

          <strong>
            {receivedQuantity} kg
          </strong>

          <small>
            Confirmed at destination
          </small>

        </div>

        <div className="manifest-summary-line" />

        <div className="manifest-summary-card">

          <span>
            TRACEABILITY
          </span>

          <strong>
            {traceability}%
          </strong>

          <small>
            Quantity accounted for
          </small>

        </div>

      </section>

      {/* =========================
          FILTERS
      ========================= */}

      <section className="panel">

        <div className="manifest-toolbar">

          <div className="manifest-search">

            <input
              type="text"
              placeholder="Search manifest, category or generator..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="manifest-filters">

            {[
              "ALL",
              "COMPLETED",
              "IN TRANSIT",
              "FLAGGED",
            ].map((status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? "manifest-filter active"
                    : "manifest-filter"
                }
                onClick={() =>
                  setStatusFilter(status)
                }
              >
                {status}
              </button>
            ))}

          </div>

        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="manifest-table-wrapper">

          <table className="manifest-table">

            <thead>
              <tr>
                <th>Manifest</th>
                <th>Category</th>
                <th>Generator</th>
                <th>Quantity</th>
                <th>Transporter</th>
                <th>Destination</th>
                <th>Received</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>

              {filteredManifests.map(
                (manifest) => (
                  <tr key={manifest.id}>

                    <td>
                      <strong>
                        {manifest.id}
                      </strong>

                      <small>
                        {manifest.pickupDate}
                      </small>
                    </td>

                    <td>
                      {manifest.category}
                    </td>

                    <td>
                      {manifest.generator}
                    </td>

                    <td>
                      {manifest.quantity} kg
                    </td>

                    <td>
                      {manifest.transporter}
                    </td>

                    <td>
                      {manifest.destination}
                    </td>

                    <td>
                      {manifest.received !== null
                        ? `${manifest.received} kg`
                        : "Pending"}
                    </td>

                    <td>
                      <span
                        className={`manifest-status ${manifest.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {manifest.status}
                      </span>
                    </td>

                    <td>

                      <button
                        type="button"
                        className="manifest-view-button"
                        onClick={() =>
                          setSelectedManifest(
                            manifest
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

          {filteredManifests.length === 0 && (
            <div className="manifest-empty">
              No manifests match your search.
            </div>
          )}

        </div>

      </section>

      {/* =========================
          CHAIN OF CUSTODY
      ========================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <div className="eyebrow">
              CHAIN OF CUSTODY
            </div>

            <h2>
              How the manifest is tracked
            </h2>

            <p>
              Each stage records the movement and
              outcome of the waste material.
            </p>
          </div>

        </div>

        <div className="manifest-chain">

          <div className="manifest-chain-step">
            <span>01</span>
            <strong>Generated</strong>
            <small>
              Waste recorded at source
            </small>
          </div>

          <div className="manifest-chain-arrow">
            →
          </div>

          <div className="manifest-chain-step">
            <span>02</span>
            <strong>Picked Up</strong>
            <small>
              Transporter receives material
            </small>
          </div>

          <div className="manifest-chain-arrow">
            →
          </div>

          <div className="manifest-chain-step">
            <span>03</span>
            <strong>GPS Tracked</strong>
            <small>
              Movement monitored during transit
            </small>
          </div>

          <div className="manifest-chain-arrow">
            →
          </div>

          <div className="manifest-chain-step">
            <span>04</span>
            <strong>Received</strong>
            <small>
              Destination confirms quantity
            </small>
          </div>

          <div className="manifest-chain-arrow">
            →
          </div>

          <div className="manifest-chain-step">
            <span>05</span>
            <strong>Treated</strong>
            <small>
              Recovery, recycling or disposal
            </small>
          </div>

        </div>

      </section>

      {/* =========================
          DATA NOTE
      ========================= */}

      <div className="manifest-data-note">

        <strong>
          Data interpretation
        </strong>

        <p>
          A quantity discrepancy or missing receipt
          creates an investigation flag. It does not
          by itself establish illegal disposal or
          environmental misconduct.
        </p>

      </div>

      {/* =========================
          DETAILS MODAL
      ========================= */}

      {selectedManifest && (

        <div
          className="manifest-modal-overlay"
          onClick={() =>
            setSelectedManifest(null)
          }
        >

          <div
            className="manifest-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="manifest-modal-header">

              <div>

                <div className="eyebrow">
                  MANIFEST DETAILS
                </div>

                <h2>
                  {selectedManifest.id}
                </h2>

              </div>

              <button
                type="button"
                className="manifest-close"
                onClick={() =>
                  setSelectedManifest(null)
                }
              >
                ×
              </button>

            </div>

            <div className="manifest-detail-grid">

              <div>
                <span>Category</span>
                <strong>
                  {selectedManifest.category}
                </strong>
              </div>

              <div>
                <span>Generator</span>
                <strong>
                  {selectedManifest.generator}
                </strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>
                  {selectedManifest.quantity} kg
                </strong>
              </div>

              <div>
                <span>Transporter</span>
                <strong>
                  {selectedManifest.transporter}
                </strong>
              </div>

              <div>
                <span>Destination</span>
                <strong>
                  {selectedManifest.destination}
                </strong>
              </div>

              <div>
                <span>Received</span>
                <strong>
                  {selectedManifest.received !== null
                    ? `${selectedManifest.received} kg`
                    : "Awaiting receipt"}
                </strong>
              </div>

              <div>
                <span>Treatment</span>
                <strong>
                  {selectedManifest.treatment}
                </strong>
              </div>

              <div>
                <span>Outcome</span>
                <strong>
                  {selectedManifest.outcome}
                </strong>
              </div>

            </div>

            <div className="manifest-modal-footer">

              <span>
                Status
              </span>

              <span
                className={`manifest-status ${selectedManifest.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {selectedManifest.status}
              </span>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default WasteManifestPage;