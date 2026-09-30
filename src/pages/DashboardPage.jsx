import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const roleData = {
  Consumer: {
    eyebrow: "CONSUMER INTELLIGENCE",
    title: "Your Product Intelligence",
    description:
      "Trace products, understand their environmental footprint and discover where they go after use.",
    stats: [
      ["Tracked Products", "06", "Products available"],
      ["Traceability", "68%", "Average lifecycle coverage"],
      ["Data Verified", "74%", "Available evidence"],
      ["Data Gaps", "08", "Need further information"],
    ],
  },

  Company: {
    eyebrow: "COMPANY INTELLIGENCE",
    title: "Transparency Dashboard",
    description:
      "Monitor lifecycle disclosure, material information, waste movement and end-of-life traceability.",
    stats: [
      ["Data Coverage", "72%", "Lifecycle information"],
      ["Material Disclosure", "92%", "Material records"],
      ["Waste Tracking", "81%", "Manifest coverage"],
      ["End of Life", "41%", "Information available"],
    ],
  },

  Researcher: {
    eyebrow: "RESEARCH INTELLIGENCE",
    title: "Environmental Intelligence",
    description:
      "Explore environmental indicators, lifecycle patterns, resource use and traceability gaps.",
    stats: [
      ["Products", "126", "Tracked products"],
      ["Data Points", "8.4K", "Available observations"],
      ["Environmental Data", "76%", "Coverage"],
      ["Data Gaps", "214", "Identified gaps"],
    ],
  },

  Authority: {
    eyebrow: "AUTHORITY INTELLIGENCE",
    title: "Environmental Oversight",
    description:
      "Monitor waste movement, investigation flags, traceability gaps and reported environmental events.",
    stats: [
      ["Active Manifests", "148", "Waste movements"],
      ["Investigations", "12", "Require review"],
      ["Verified Incidents", "07", "Verified records"],
      ["Data Gaps", "31", "Require evidence"],
    ],
  },
};

const lifecycle = [
  ["Raw Material", 92],
  ["Manufacturing", 81],
  ["Distribution", 64],
  ["Consumer Use", 52],
  ["Return / Reuse", 58],
  ["Recycling", 42],
  ["Final Outcome", 31],
];

const gaps = [
  {
    title: "End-of-life destination unavailable",
    product: "Organic Cotton T-Shirt",
    status: "DATA GAP",
  },
  {
    title: "Post-consumer recycling information incomplete",
    product: "Smartphone X1",
    status: "PARTIAL",
  },
  {
    title: "Take-back outcome requires additional evidence",
    product: "PET Beverage Bottle",
    status: "REVIEW",
  },
];

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("ecoverseUser");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("ecoverseUser");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  const data =
    roleData[user.role] || roleData.Consumer;

  const logout = () => {
    localStorage.removeItem("ecoverseUser");
    navigate("/login");
  };

  return (
    <div className="page dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            {data.eyebrow}
          </div>

          <h1>
            {data.title}
          </h1>

          <p>
            {data.description}
          </p>
        </div>

        <div className="dashboard-user">

          <div className="user-info">

            <strong>
              {user.name || user.role}
            </strong>

            <span>
              {user.email}
            </span>

          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* =========================
          ROLE BANNER
      ========================= */}

      <div className="role-banner">

        <div className="role-icon">
          {user.role?.charAt(0) || "C"}
        </div>

        <div>

          <strong>
            {user.role} Workspace
          </strong>

          <p>
            Your dashboard is configured for the{" "}
            {user.role?.toLowerCase()} role.
          </p>

        </div>

      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="stats-grid">

        {data.stats.map(
          ([title, value, description]) => (
            <div
              className="stat-card"
              key={title}
            >

              <span>
                {title}
              </span>

              <strong>
                {value}
              </strong>

              <small>
                {description}
              </small>

            </div>
          )
        )}

      </div>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="quick-actions">

        <div className="section-label">
          QUICK ACCESS
        </div>

        <div className="quick-action-grid">

          <Link
            to="/consumer"
            className="quick-action"
          >
            <span>01</span>

            <strong>
              Search Products
            </strong>

            <p>
              Explore a product's lifecycle.
            </p>
          </Link>

          <Link
            to="/environmental-impact"
            className="quick-action"
          >
            <span>02</span>

            <strong>
              Environmental Impact
            </strong>

            <p>
              Explore resource and impact indicators.
            </p>
          </Link>

          <Link
            to="/climate-lab"
            className="quick-action"
          >
            <span>03</span>

            <strong>
              Climate Lab
            </strong>

            <p>
              Test alternative lifecycle scenarios.
            </p>
          </Link>

          <Link
            to="/waste-manifest"
            className="quick-action"
          >
            <span>04</span>

            <strong>
              Waste Manifest
            </strong>

            <p>
              Follow waste movement and outcomes.
            </p>
          </Link>

        </div>

      </section>

      {/* =========================
          LIFECYCLE + CONFIDENCE
      ========================= */}

      <div className="dashboard-grid">

        {/* LIFECYCLE */}

        <section className="panel large-panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                LIFECYCLE COVERAGE
              </div>

              <h2>
                Product Traceability
              </h2>

              <p>
                Availability of lifecycle information
                across tracked products.
              </p>

            </div>

            <span className="dashboard-badge">
              LIVE DATA
            </span>

          </div>

          <div className="lifecycle-bars">

            {lifecycle.map(
              ([stage, value]) => (
                <div
                  className="bar-row"
                  key={stage}
                >

                  <div className="bar-label">

                    <span>
                      {stage}
                    </span>

                    <strong>
                      {value}%
                    </strong>

                  </div>

                  <div className="bar-track">

                    <div
                      className="bar-fill"
                      style={{
                        width: `${value}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </section>

        {/* DATA CONFIDENCE */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                DATA QUALITY
              </div>

              <h2>
                Confidence
              </h2>

            </div>

          </div>

          <div className="confidence-list">

            <div>
              <span>
                Verified / External
              </span>

              <span className="confidence green">
                VERIFIED
              </span>
            </div>

            <div>
              <span>
                Company Reported
              </span>

              <span className="confidence yellow">
                REPORTED
              </span>
            </div>

            <div>
              <span>
                Modelled Estimate
              </span>

              <span className="confidence blue">
                MODELLED
              </span>
            </div>

            <div>
              <span>
                Information unavailable
              </span>

              <span className="confidence grey">
                UNAVAILABLE
              </span>
            </div>

          </div>

          <div className="confidence-note">
            Missing information is shown as a data gap,
            not as an assumption about environmental
            performance.
          </div>

        </section>

      </div>

      {/* =========================
          DATA GAPS
      ========================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <div className="eyebrow">
              DATA-GAP ENGINE
            </div>

            <h2>
              Traceability Gaps
            </h2>

            <p>
              Areas where additional lifecycle evidence
              is required.
            </p>

          </div>

          <Link
            to="/consumer"
            className="light-button"
          >
            Explore Products
          </Link>

        </div>

        <div className="gap-list">

          {gaps.map((gap) => (

            <div
              className="gap-row"
              key={gap.title}
            >

              <div className="gap-icon">
                !
              </div>

              <div>

                <strong>
                  {gap.title}
                </strong>

                <p>
                  {gap.product}
                </p>

              </div>

              <span>
                {gap.status}
              </span>

            </div>

          ))}

        </div>

      </section>

      {/* =========================
          ROLE SPECIFIC SECTION
      ========================= */}

      <section className="role-section">

        {user.role === "Consumer" && (
          <>
            <div className="eyebrow">
              CONSUMER VIEW
            </div>

            <h2>
              Understand what happens after purchase.
            </h2>

            <p>
              Search products and follow their lifecycle
              from raw material to end-of-life.
            </p>

            <Link
              to="/consumer"
              className="dark-button"
            >
              Trace a Product →
            </Link>
          </>
        )}

        {user.role === "Company" && (
          <>
            <div className="eyebrow">
              COMPANY VIEW
            </div>

            <h2>
              Improve lifecycle transparency.
            </h2>

            <p>
              Review disclosure coverage, waste manifests,
              material information and end-of-life gaps.
            </p>

            <Link
              to="/waste-manifest"
              className="dark-button"
            >
              Open Waste Manifest →
            </Link>
          </>
        )}

        {user.role === "Researcher" && (
          <>
            <div className="eyebrow">
              RESEARCH VIEW
            </div>

            <h2>
              Explore environmental patterns.
            </h2>

            <p>
              Compare lifecycle indicators and test
              modelled scenarios through the Climate Lab.
            </p>

            <Link
              to="/climate-lab"
              className="dark-button"
            >
              Open Climate Lab →
            </Link>
          </>
        )}

        {user.role === "Authority" && (
          <>
            <div className="eyebrow">
              AUTHORITY VIEW
            </div>

            <h2>
              Review environmental evidence.
            </h2>

            <p>
              Monitor waste movements and identify records
              that require investigation or additional evidence.
            </p>

            <Link
              to="/waste-manifest"
              className="dark-button"
            >
              Review Manifests →
            </Link>
          </>
        )}

      </section>

    </div>
  );
}

export default DashboardPage;