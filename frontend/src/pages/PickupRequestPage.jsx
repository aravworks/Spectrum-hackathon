import { useState, useEffect } from "react";
import "../styles/pickup/pickup.css";

const BACKEND = "https://spectrum-hackathon.onrender.com/api/v1";

const STATUS_COLOR = {
  PENDING:   { bg: "#fff8e1", color: "#f39c12", label: "Pending" },
  ASSIGNED:  { bg: "#e3f2fd", color: "#2196f3", label: "Assigned" },
  COMPLETED: { bg: "#e8f5e9", color: "#27ae60", label: "Completed" },
  CANCELLED: { bg: "#fdecea", color: "#e74c3c", label: "Cancelled" },
};

function PickupRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [pickups, setPickups]     = useState([]);
  const [pickupsLoading, setPickupsLoading] = useState(true);
  const [requestId, setRequestId] = useState(null);

  const [form, setForm] = useState({
    wasteType:     "",
    quantity:      "",
    unit:          "kg",
    location:      "",
    preferredDate: "",
    description:   "",
  });

  // ── Fetch existing pickups on mount ─────────────────────────────────
  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const token = localStorage.getItem("ecoverseToken");
        const res = await fetch(`${BACKEND}/pickups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPickups(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.warn("Could not load pickups:", e);
      } finally {
        setPickupsLoading(false);
      }
    };
    fetchPickups();
  }, [submitted]); // re-fetch after a new submission

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("ecoverseToken");

      // Validate quantity
      const weightKg = parseFloat(form.quantity);
      if (isNaN(weightKg) || weightKg <= 0) {
        throw new Error("Please enter a valid quantity.");
      }

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
      const backendCategory = categoryMap[form.wasteType] || "MIXED";

      const res = await fetch(`${BACKEND}/pickups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: { lat: 26.4499, lng: 80.3319 },
          estimated_weight_kg: weightKg,
          category: backendCategory,
          preferred_window: { start_time: "09:00:00", end_time: "17:00:00" },
          notes: `Address: ${form.location}
Date: ${form.preferredDate}
${form.description || ""}`
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = "Failed to submit pickup request.";
        if (err.detail) {
          if (typeof err.detail === 'string') errMsg = err.detail;
          else if (Array.isArray(err.detail)) errMsg = err.detail.map(e => e.msg).join(', ');
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setRequestId(data.id);
      setSubmitted(true);

      // Reset form
      setForm({ wasteType: "", quantity: "", unit: "kg", location: "", preferredDate: "", description: "" });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page pickup-page">
        <section className="pickup-success panel">
          <div className="eyebrow">PICKUP REQUEST CREATED</div>
          <div className="pickup-success-icon">✅</div>
          <h1>Pickup request submitted.</h1>
          <p>Your waste pickup request has been registered and is waiting for assignment.</p>
          {requestId && (
            <div className="pickup-request-id">
              <span>REQUEST ID</span>
              <strong>{requestId}</strong>
            </div>
          )}
          <div className="pickup-status-flow">
            <div className="pickup-status active"><span>01</span><strong>Requested</strong><small>Submitted</small></div>
            <div className="pickup-line" />
            <div className="pickup-status"><span>02</span><strong>Assigned</strong><small>Awaiting operator</small></div>
            <div className="pickup-line" />
            <div className="pickup-status"><span>03</span><strong>Picked Up</strong><small>Collection</small></div>
            <div className="pickup-line" />
            <div className="pickup-status"><span>04</span><strong>Received</strong><small>Destination</small></div>
          </div>
          <button className="dark-button" onClick={() => setSubmitted(false)}>
            Submit Another Request →
          </button>
        </section>
      </div>
    );
  }

  // ── Main page ────────────────────────────────────────────────────────
  return (
    <div className="page pickup-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">MATERIAL RECOVERY</div>
          <h1>Request Waste Pickup</h1>
          <p>Submit a pickup request for recyclable, recoverable or other material requiring collection.</p>
        </div>
        <div className="report-user-badge">PICKUP REQUEST</div>
      </div>

      <div className="pickup-grid">

        {/* FORM */}
        <section className="panel pickup-form-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">NEW REQUEST</div>
              <h2>Pickup information</h2>
              <p>Provide the material and collection details.</p>
            </div>
          </div>

          <form className="pickup-form" onSubmit={handleSubmit}>
            <div className="pickup-form-row">
              <label>
                Waste / Material Type
                <select name="wasteType" value={form.wasteType} onChange={handleChange} required>
                  <option value="">Select material</option>
                  <option value="Textile">Textile / Fashion</option>
                  <option value="Plastic">Plastic / Packaging</option>
                  <option value="E-waste">Electronics / E-waste</option>
                  <option value="Food">Food Waste</option>
                  <option value="Batteries">Batteries</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Household">Household Waste</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Quantity
                <div className="quantity-input">
                  <input
                    type="number"
                    name="quantity"
                    min="0.1"
                    step="0.1"
                    placeholder="e.g. 25"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                  <select name="unit" value={form.unit} onChange={handleChange}>
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                    <option value="litres">litres</option>
                  </select>
                </div>
              </label>
            </div>

            <label>
              Pickup Location
              <input
                type="text"
                name="location"
                placeholder="Area, city, landmark or address"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Preferred Pickup Date
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </label>

            <label>
              Additional Information
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the material, packaging, accessibility or any other useful information..."
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <div className="pickup-note">
              <strong>Before submitting</strong>
              <p>Pickup availability and assignment will be confirmed by the waste operator. The request does not automatically confirm collection.</p>
            </div>

            <button type="submit" className="dark-button pickup-submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit Pickup Request →"}
            </button>
          </form>
        </section>

        <aside>
          {/* REQUEST FLOW */}
          <section className="panel pickup-info-panel">
            <div className="eyebrow">REQUEST FLOW</div>
            <h2>What happens next?</h2>
            <div className="pickup-process">
              <div><span>01</span><div><strong>REQUESTED</strong><p>Your pickup request enters the system.</p></div></div>
              <div><span>02</span><div><strong>ASSIGNED</strong><p>A collection operator is assigned.</p></div></div>
              <div><span>03</span><div><strong>PICKED UP</strong><p>Material is collected and recorded.</p></div></div>
              <div><span>04</span><div><strong>TRACKING</strong><p>Movement connected to waste manifest.</p></div></div>
            </div>
          </section>

          {/* SCHEDULED PICKUPS — live from Supabase */}
          <section className="panel" style={{ marginTop: 16 }}>
            <div className="eyebrow">MY SCHEDULED PICKUPS</div>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Your requests</h2>

            {pickupsLoading ? (
              <p style={{ color: "#718078", fontSize: 14 }}>Loading your pickups…</p>
            ) : pickups.length === 0 ? (
              <p style={{ color: "#718078", fontSize: 14 }}>No pickups found. Submit your first request above!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pickups.map((p) => {
                  const s = STATUS_COLOR[p.state] || STATUS_COLOR.PENDING;
                  const date = p.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—";
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.color}40`,
                        borderLeft: `4px solid ${s.color}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.category || "Waste Pickup"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                        {p.estimated_weight_kg} kg · Submitted {date}
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontFamily: "monospace" }}>
                        #{String(p.id).slice(0, 8)}…
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default PickupRequestPage;