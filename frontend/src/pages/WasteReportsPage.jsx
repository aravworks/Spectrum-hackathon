import { useMemo, useState } from "react";

const wasteData = [
  {
    month: "Apr",
    textile: 210,
    plastic: 340,
    electronics: 120,
    food: 280,
    batteries: 65,
  },
  {
    month: "May",
    textile: 245,
    plastic: 390,
    electronics: 135,
    food: 310,
    batteries: 72,
  },
  {
    month: "Jun",
    textile: 280,
    plastic: 410,
    electronics: 148,
    food: 335,
    batteries: 81,
  },
  {
    month: "Jul",
    textile: 265,
    plastic: 430,
    electronics: 160,
    food: 350,
    batteries: 88,
  },
  {
    month: "Aug",
    textile: 310,
    plastic: 470,
    electronics: 172,
    food: 380,
    batteries: 94,
  },
  {
    month: "Sep",
    textile: 295,
    plastic: 455,
    electronics: 184,
    food: 365,
    batteries: 102,
  },
];

const categoryData = [
  {
    name: "Plastic / Packaging",
    value: 2495,
    percentage: 36,
  },
  {
    name: "Food Waste",
    value: 2020,
    percentage: 29,
  },
  {
    name: "Textile Waste",
    value: 1605,
    percentage: 23,
  },
  {
    name: "Electronics / E-waste",
    value: 919,
    percentage: 13,
  },
  {
    name: "Batteries",
    value: 502,
    percentage: 7,
  },
];

const reportRecords = [
  {
    id: "WR-2026-091",
    category: "Textile",
    generated: 1840,
    recovered: 1260,
    recycled: 980,
    disposal: 320,
    coverage: 82,
    status: "REPORTED",
  },
  {
    id: "WR-2026-092",
    category: "Plastic",
    generated: 2495,
    recovered: 1960,
    recycled: 1740,
    disposal: 535,
    coverage: 91,
    status: "VERIFIED",
  },
  {
    id: "WR-2026-093",
    category: "E-waste",
    generated: 919,
    recovered: 610,
    recycled: 470,
    disposal: 309,
    coverage: 74,
    status: "PARTIAL",
  },
  {
    id: "WR-2026-094",
    category: "Food",
    generated: 2020,
    recovered: 840,
    recycled: 520,
    disposal: 1180,
    coverage: 68,
    status: "REPORTED",
  },
  {
    id: "WR-2026-095",
    category: "Batteries",
    generated: 502,
    recovered: 340,
    recycled: 276,
    disposal: 162,
    coverage: 61,
    status: "PARTIAL",
  },
];

function WasteReportsPage() {
  const [period, setPeriod] = useState("6 MONTHS");
  const [category, setCategory] = useState("ALL");

  const totals = useMemo(() => {
    return reportRecords.reduce(
      (acc, item) => {
        acc.generated += item.generated;
        acc.recovered += item.recovered;
        acc.recycled += item.recycled;
        acc.disposal += item.disposal;
        return acc;
      },
      {
        generated: 0,
        recovered: 0,
        recycled: 0,
        disposal: 0,
      }
    );
  }, []);

  const recoveryRate = Math.round(
    (totals.recovered / totals.generated) * 100
  );

  const recyclingRate = Math.round(
    (totals.recycled / totals.generated) * 100
  );

  const filteredRecords =
    category === "ALL"
      ? reportRecords
      : reportRecords.filter(
          (item) => item.category === category
        );

  const maxMonthlyWaste = Math.max(
    ...wasteData.map((item) =>
      item.textile +
      item.plastic +
      item.electronics +
      item.food +
      item.batteries
    )
  );

  return (
    <div className="page waste-reports-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            WASTE INTELLIGENCE
          </div>

          <h1>
            Waste Reports
          </h1>

          <p>
            Analyze waste generation, recovery,
            recycling and final outcomes across
            tracked material streams.
          </p>
        </div>

        <div className="report-actions">

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
          >
            <option>6 MONTHS</option>
            <option>12 MONTHS</option>
            <option>YEAR TO DATE</option>
          </select>

          <button
            className="report-export-button"
            onClick={() =>
              alert(
                "Report export will be connected to the backend."
              )
            }
          >
            Export Report ↓
          </button>

        </div>

      </div>

      {/* =========================
          KPI CARDS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <span>
            TOTAL WASTE
          </span>

          <strong>
            {totals.generated.toLocaleString()}
          </strong>

          <small>
            kg recorded
          </small>

        </div>

        <div className="stat-card">

          <span>
            RECOVERED
          </span>

          <strong>
            {totals.recovered.toLocaleString()}
          </strong>

          <small>
            kg recovered
          </small>

        </div>

        <div className="stat-card">

          <span>
            RECYCLING RATE
          </span>

          <strong>
            {recyclingRate}%
          </strong>

          <small>
            Of recorded waste
          </small>

        </div>

        <div className="stat-card">

          <span>
            RECOVERY RATE
          </span>

          <strong>
            {recoveryRate}%
          </strong>

          <small>
            Material recovered
          </small>

        </div>

      </div>

      {/* =========================
          MAIN ANALYTICS
      ========================= */}

      <div className="report-grid">

        {/* CATEGORY BREAKDOWN */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                WASTE COMPOSITION
              </div>

              <h2>
                By material category
              </h2>

              <p>
                Recorded waste across tracked categories.
              </p>

            </div>

          </div>

          <div className="category-report-list">

            {categoryData.map((item) => (

              <div
                className="category-report-row"
                key={item.name}
              >

                <div className="category-report-header">

                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {item.value.toLocaleString()} kg
                  </strong>

                </div>

                <div className="category-report-track">

                  <div
                    className="category-report-fill"
                    style={{
                      width: `${Math.min(
                        item.percentage * 2.2,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <small>
                  {item.percentage}% of recorded
                  category volume
                </small>

              </div>

            ))}

          </div>

        </section>

        {/* OUTCOME BREAKDOWN */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                FINAL OUTCOME
              </div>

              <h2>
                Waste disposition
              </h2>

              <p>
                Current recorded treatment outcomes.
              </p>

            </div>

          </div>

          <div className="outcome-chart">

            <div
              className="outcome-circle"
              style={{
                "--recovery":
                  `${recoveryRate * 3.6}deg`,
              }}
            >
              <div>
                <strong>
                  {recoveryRate}%
                </strong>

                <span>
                  recovered
                </span>
              </div>
            </div>

            <div className="outcome-legend">

              <div>
                <span className="legend-dot recovered" />
                <span>Recovered</span>
                <strong>
                  {totals.recovered.toLocaleString()} kg
                </strong>
              </div>

              <div>
                <span className="legend-dot recycled" />
                <span>Recycled</span>
                <strong>
                  {totals.recycled.toLocaleString()} kg
                </strong>
              </div>

              <div>
                <span className="legend-dot disposal" />
                <span>Recorded disposal</span>
                <strong>
                  {totals.disposal.toLocaleString()} kg
                </strong>
              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =========================
          MONTHLY TREND
      ========================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <div className="eyebrow">
              WASTE TREND
            </div>

            <h2>
              Monthly generation
            </h2>

            <p>
              Recorded waste generation by category.
            </p>

          </div>

          <span className="dashboard-badge">
            {period}
          </span>

        </div>

        <div className="waste-trend-chart">

          {wasteData.map((month) => {

            const total =
              month.textile +
              month.plastic +
              month.electronics +
              month.food +
              month.batteries;

            const height =
              (total / maxMonthlyWaste) * 100;

            return (
              <div
                className="trend-column"
                key={month.month}
              >

                <div className="trend-value">
                  {total}
                </div>

                <div className="trend-bar-wrapper">

                  <div
                    className="trend-bar"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                </div>

                <span>
                  {month.month}
                </span>

              </div>
            );
          })}

        </div>

        <div className="trend-legend">

          <span>
            Textile
          </span>

          <span>
            Plastic
          </span>

          <span>
            E-waste
          </span>

          <span>
            Food
          </span>

          <span>
            Batteries
          </span>

        </div>

      </section>

      {/* =========================
          TRACEABILITY
      ========================= */}

      <div className="report-grid">

        <section className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                TRACEABILITY
              </div>

              <h2>
                Reporting coverage
              </h2>

              <p>
                Availability of supporting waste records.
              </p>

            </div>

          </div>

          <div className="coverage-list">

            {reportRecords.map((item) => (

              <div
                className="coverage-row"
                key={item.id}
              >

                <div className="coverage-header">

                  <div>
                    <strong>
                      {item.category}
                    </strong>

                    <span>
                      {item.id}
                    </span>
                  </div>

                  <strong>
                    {item.coverage}%
                  </strong>

                </div>

                <div className="coverage-track">

                  <div
                    className="coverage-fill"
                    style={{
                      width: `${item.coverage}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* DATA GAPS */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                DATA-GAP ENGINE
              </div>

              <h2>
                Reporting observations
              </h2>

            </div>

          </div>

          <div className="report-observations">

            <div className="report-observation">

              <span>
                01
              </span>

              <div>
                <strong>
                  Final outcome unavailable
                </strong>

                <p>
                  Some waste records do not yet contain
                  verified final destination information.
                </p>
              </div>

            </div>

            <div className="report-observation">

              <span>
                02
              </span>

              <div>
                <strong>
                  Quantity discrepancy
                </strong>

                <p>
                  Some manifests show differences between
                  generated and received quantities.
                </p>
              </div>

            </div>

            <div className="report-observation">

              <span>
                03
              </span>

              <div>
                <strong>
                  Evidence coverage varies
                </strong>

                <p>
                  Reported and modelled values should be
                  distinguished from independently verified data.
                </p>
              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =========================
          RECORD TABLE
      ========================= */}

      <section className="panel">

        <div className="report-table-header">

          <div>

            <div className="eyebrow">
              WASTE RECORDS
            </div>

            <h2>
              Category report register
            </h2>

          </div>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="ALL">
              All Categories
            </option>

            <option value="Textile">
              Textile
            </option>

            <option value="Plastic">
              Plastic
            </option>

            <option value="E-waste">
              E-waste
            </option>

            <option value="Food">
              Food
            </option>

            <option value="Batteries">
              Batteries
            </option>
          </select>

        </div>

        <div className="waste-report-table-wrapper">

          <table className="waste-report-table">

            <thead>

              <tr>
                <th>Report ID</th>
                <th>Category</th>
                <th>Generated</th>
                <th>Recovered</th>
                <th>Recycled</th>
                <th>Disposal</th>
                <th>Coverage</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {filteredRecords.map((record) => (

                <tr key={record.id}>

                  <td>
                    <strong>
                      {record.id}
                    </strong>
                  </td>

                  <td>
                    {record.category}
                  </td>

                  <td>
                    {record.generated.toLocaleString()} kg
                  </td>

                  <td>
                    {record.recovered.toLocaleString()} kg
                  </td>

                  <td>
                    {record.recycled.toLocaleString()} kg
                  </td>

                  <td>
                    {record.disposal.toLocaleString()} kg
                  </td>

                  <td>
                    {record.coverage}%
                  </td>

                  <td>

                    <span
                      className={`report-status ${
                        record.status === "VERIFIED"
                          ? "report-verified"
                          : record.status === "PARTIAL"
                          ? "report-partial"
                          : "report-reported"
                      }`}
                    >
                      {record.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

      {/* =========================
          REPORT NOTE
      ========================= */}

      <section className="report-note">

        <div className="report-note-icon">
          i
        </div>

        <div>

          <strong>
            How to interpret this report
          </strong>

          <p>
            Waste Reports summarize recorded and
            modelled information available to ECOVERSE.
            A missing outcome or discrepancy indicates
            that additional evidence is required; it does
            not by itself establish improper disposal.
          </p>

        </div>

      </section>

    </div>
  );
}

export default WasteReportsPage;