import { useState } from "react";
import "../styles/report-waste/report-waste.css";
function ReportWasteIssuePage() {
  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
    date: "",
    severity: "LOW",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("ecoverseToken");
      const categoryMap = {
        "Textile": "MIXED",
        "Plastic": "PLASTIC",
        "E-waste": "E_WASTE",
        "Food": "ORGANIC",
        "Batteries": "HAZARDOUS",
        "Cosmetics": "HAZARDOUS",
        "Household": "MIXED",
        "Other": "MIXED"
      };
      const backendCategory = categoryMap[form.category] || "MIXED";
      const weight = parseFloat(form.estimatedQuantity || 0);

      const res = await fetch("https://spectrum-hackathon.onrender.com/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          location: { lat: 26.4499, lng: 80.3319 },
          category: backendCategory,
          description: `Address: ${form.location}
${form.description}`,
          estimated_weight_kg: weight > 0 ? weight : 1.0,
          severity: form.severity || "LOW"
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = "Failed to submit waste report.";
        if (err.detail) {
          if (typeof err.detail === 'string') errMsg = err.detail;
          else if (Array.isArray(err.detail)) errMsg = err.detail.map(e => e.msg).join(', ');
        }
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      console.log("Waste issue report:", data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit report: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  if (submitted) {
    return (
      <div className="page report-waste-page">

        <section className="report-success">

          <div className="report-success-icon">
            ✓
          </div>

          <div className="eyebrow">
            REPORT SUBMITTED
          </div>

          <h1>
            Environmental issue reported.
          </h1>

          <p>
            Your report has been recorded as a
            <strong> USER REPORT</strong>.
            It will require review before it can
            become a verified environmental incident.
          </p>

          <div className="report-status-flow">

            <div className="report-flow-step active">
              <span>01</span>
              <strong>User Report</strong>
              <small>Submitted</small>
            </div>

            <div className="report-flow-line" />

            <div className="report-flow-step">
              <span>02</span>
              <strong>Review</strong>
              <small>Evidence check</small>
            </div>

            <div className="report-flow-line" />

            <div className="report-flow-step">
              <span>03</span>
              <strong>Verified Incident</strong>
              <small>Only if evidence supports it</small>
            </div>

          </div>

          <button
            type="button"
            className="dark-button"
            onClick={() => {
              setSubmitted(false);
              setForm({
                category: "",
                location: "",
                description: "",
                date: "",
                severity: "LOW",
              });
            }}
          >
            Submit Another Report →
          </button>

        </section>

      </div>
    );
  }

  return (
    <div className="page report-waste-page">

      <div className="page-header">

        <div>
          <div className="eyebrow">
            COMMUNITY ENVIRONMENTAL INTELLIGENCE
          </div>

          <h1>
            Report Waste Issue
          </h1>

          <p>
            Report an observed waste or environmental
            issue so it can be reviewed and connected
            with ECOVERSE environmental intelligence.
          </p>
        </div>

        <div className="report-user-badge">
          USER REPORT
        </div>

      </div>

      <div className="report-waste-grid">

        {/* FORM */}

        <section className="panel report-form-panel">

          <div className="panel-heading">

            <div>
              <div className="eyebrow">
                NEW REPORT
              </div>

              <h2>
                Environmental observation
              </h2>

              <p>
                Provide the information you observed.
              </p>
            </div>

          </div>

          <form
            className="report-waste-form"
            onSubmit={handleSubmit}
          >

            <label>
              Waste category

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                <option value="Textile">
                  Textile / Fashion
                </option>

                <option value="Plastic">
                  Plastic / Packaging
                </option>

                <option value="E-waste">
                  Electronics / E-waste
                </option>

                <option value="Food">
                  Food Waste
                </option>

                <option value="Batteries">
                  Batteries
                </option>

                <option value="Construction">
                  Construction Waste
                </option>

                <option value="Household">
                  Household Waste
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>

            <label>
              Location

              <input
                type="text"
                name="location"
                placeholder="Area, city or landmark"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <div className="report-form-row">

              <label>
                Observation date

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Severity

                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>
                </select>
              </label>

            </div>

            <label>
              Describe what you observed

              <textarea
                name="description"
                rows="7"
                placeholder="Describe the waste, approximate quantity, location conditions or other relevant observations..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <div className="report-evidence-box">

              <div>
                <strong>
                  Evidence
                </strong>

                <p>
                  Photo and supporting evidence can be
                  connected when backend storage is enabled.
                </p>
              </div>

              <button
                type="button"
                className="light-button"
                onClick={() =>
                  alert(
                    "Photo upload will be connected to the backend."
                  )
                }
              >
                Add Photo
              </button>

            </div>

            <button
              type="submit"
              className="dark-button report-submit-button"
            >
              Submit Environmental Report →
            </button>

          </form>

        </section>

        {/* INFORMATION */}

        <aside>

          <section className="panel report-info-panel">

            <div className="eyebrow">
              HOW IT WORKS
            </div>

            <h2>
              From observation to evidence
            </h2>

            <div className="report-process">

              <div>
                <span>01</span>

                <div>
                  <strong>
                    USER REPORT
                  </strong>

                  <p>
                    A community member records
                    an environmental observation.
                  </p>
                </div>
              </div>

              <div>
                <span>02</span>

                <div>
                  <strong>
                    REVIEW
                  </strong>

                  <p>
                    The information and available
                    evidence are reviewed.
                  </p>
                </div>
              </div>

              <div>
                <span>03</span>

                <div>
                  <strong>
                    VERIFIED INCIDENT
                  </strong>

                  <p>
                    Verification is based on supporting
                    evidence, not simply the report itself.
                  </p>
                </div>
              </div>

            </div>

          </section>

          <section className="report-guidance">

            <div className="eyebrow">
              REPORTING GUIDANCE
            </div>

            <h3>
              What makes a report useful?
            </h3>

            <ul>
              <li>
                Give the clearest location possible.
              </li>

              <li>
                Describe what you actually observed.
              </li>

              <li>
                Include approximate quantity when known.
              </li>

              <li>
                Add evidence when available.
              </li>

              <li>
                Avoid assuming the cause when it is unknown.
              </li>
            </ul>

          </section>

        </aside>

      </div>

      <section className="report-disclaimer">

        <strong>
          Important
        </strong>

        <p>
          A user-submitted report is an observation,
          not proof of improper disposal or environmental
          misconduct. ECOVERSE distinguishes USER REPORT
          from VERIFIED INCIDENT.
        </p>

      </section>

    </div>
  );
}

export default ReportWasteIssuePage;