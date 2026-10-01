import { useState } from "react";
import "../styles/complaint-tracking/complaint-tracking.css";

function ComplaintTrackingPage() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;

    setLoading(true);
    setNotFound(false);
    setComplaint(null);
    const searchId = complaintId.trim().toLowerCase();

    try {
      const token = localStorage.getItem("ecoverseToken");
      
      // Fetch user's reports
      const reportsRes = await fetch("https://spectrum-hackathon.onrender.com/api/v1/reports", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const reports = await reportsRes.json();
      
      // Fetch user's pickups
      const pickupsRes = await fetch("https://spectrum-hackathon.onrender.com/api/v1/pickups", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const pickups = await pickupsRes.json();
      
      const allItems = [...(Array.isArray(reports) ? reports : []), ...(Array.isArray(pickups) ? pickups : [])];
      
      const item = allItems.find(x => x.id.toLowerCase().startsWith(searchId) || x.id.toLowerCase() === searchId);
      
      if (item) {
        const isReport = !!item.severity;
        
        let statusString = "UNDER REVIEW";
        if (item.state === "COMPLETED" || item.state === "RESOLVED") statusString = "RESOLVED";
        else if (item.state === "ASSIGNED") statusString = "UNDER REVIEW";
        else if (item.state === "PENDING" || item.state === "SUBMITTED") statusString = "SUBMITTED";
        else statusString = item.state || "UNDER REVIEW";

        setComplaint({
          id: item.id,
          type: isReport ? "Waste Report" : "Pickup Request",
          category: item.category,
          location: "Kanpur (GPS Logged)",
          submitted: new Date(item.created_at).toLocaleDateString(),
          description: item.description || item.notes || "No description provided.",
          status: statusString,
          priority: item.severity || "MEDIUM",
          assignedTo: isReport ? "City Admin" : "Collection Operator",
          updated: new Date(item.updated_at || item.created_at).toLocaleDateString(),
        });
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Error fetching record:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page complaint-tracking-page">

      {/* HEADER */}
      <div className="page-header">

        <div>
          <div className="eyebrow">
            SERVICE & ENVIRONMENTAL MONITORING
          </div>

          <h1>Complaint Tracking</h1>

          <p>
            Track the status of a pickup or environmental
            service complaint using its complaint ID.
          </p>
        </div>

        <div className="report-user-badge">
          COMPLAINT STATUS
        </div>

      </div>

      {/* SEARCH */}
      <section className="panel complaint-search-panel">

        <div className="eyebrow">
          TRACK A COMPLAINT
        </div>

        <h2>
          Enter Complaint ID
        </h2>

        <p>
          Example: UUID (e.g., 5f4d...)
        </p>

        <form
          className="complaint-search-form"
          onSubmit={handleTrack}
        >

          <input
            type="text"
            placeholder="Paste ID here"
            value={complaintId}
            onChange={(e) =>
              setComplaintId(e.target.value)
            }
          />

          <button type="submit" className="dark-button" disabled={loading}>
            {loading ? "Searching..." : "Track Record ->"}
          </button>

        </form>

      </section>

      {/* RESULT */}
      {complaint && (
        <>
          <section className="panel complaint-overview">

            <div className="complaint-overview-top">

              <div>
                <div className="eyebrow">
                  COMPLAINT
                </div>

                <h2>
                  {complaint.id}
                </h2>

                <p>
                  {complaint.type} · {complaint.category}
                </p>
              </div>

              <div
                className={`complaint-status-badge ${
                  complaint.status === "RESOLVED"
                    ? "resolved"
                    : "review"
                }`}
              >
                {complaint.status}
              </div>

            </div>

            <div className="complaint-info-grid">

              <div>
                <span>LOCATION</span>
                <strong>{complaint.location}</strong>
              </div>

              <div>
                <span>SUBMITTED</span>
                <strong>{complaint.submitted}</strong>
              </div>

              <div>
                <span>PRIORITY</span>
                <strong>{complaint.priority}</strong>
              </div>

              <div>
                <span>ASSIGNED TO</span>
                <strong>{complaint.assignedTo}</strong>
              </div>

            </div>

          </section>

          {/* STATUS TIMELINE */}
          <section className="panel complaint-timeline-panel">

            <div className="eyebrow">
              STATUS TIMELINE
            </div>

            <h2>
              Complaint progress
            </h2>

            <div className="complaint-timeline">

              <div className="complaint-step completed">

                <div className="complaint-step-marker">
                  ✓
                </div>

                <div>
                  <strong>Complaint Submitted</strong>

                  <p>
                    Your complaint was successfully
                    registered in ECOVERSE.
                  </p>
                </div>

              </div>

              <div className="complaint-step-line" />

              <div
                className={`complaint-step ${
                  complaint.status === "UNDER REVIEW" ||
                  complaint.status === "RESOLVED"
                    ? "completed"
                    : ""
                }`}
              >

                <div className="complaint-step-marker">
                  {complaint.status === "UNDER REVIEW" ||
                  complaint.status === "RESOLVED"
                    ? "✓"
                    : "02"}
                </div>

                <div>
                  <strong>Under Review</strong>

                  <p>
                    The complaint and available information
                    are being reviewed.
                  </p>
                </div>

              </div>

              <div className="complaint-step-line" />

              <div
                className={`complaint-step ${
                  complaint.status === "RESOLVED"
                    ? "completed"
                    : ""
                }`}
              >

                <div className="complaint-step-marker">
                  {complaint.status === "RESOLVED"
                    ? "✓"
                    : "03"}
                </div>

                <div>
                  <strong>Resolution</strong>

                  <p>
                    The issue is resolved after the required
                    review and action.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* DETAILS */}
          <section className="complaint-details-grid">

            <div className="panel complaint-detail-card">

              <div className="eyebrow">
                COMPLAINT DETAILS
              </div>

              <h3>
                Reported observation
              </h3>

              <p>
                {complaint.description}
              </p>

              <div className="complaint-last-update">
                Last updated: {complaint.updated}
              </div>

            </div>

            <div className="panel complaint-detail-card">

              <div className="eyebrow">
                ECOVERSE RECORD
              </div>

              <h3>
                Evidence-based workflow
              </h3>

              <p>
                Complaint status represents the current
                review state. A complaint itself does not
                establish environmental misconduct.
              </p>

              <div className="complaint-record-status">
                <span />
                Record active
              </div>

            </div>

          </section>
        </>
      )}

      {/* NO RESULT */}
      {notFound && (
        <section className="panel complaint-not-found">

          <div className="complaint-not-found-icon">
            ?
          </div>

          <h2>
            Complaint not found
          </h2>

          <p>
            No complaint record was found for
            <strong> {complaintId.toUpperCase()}</strong>.
          </p>

          <small>
            Please provide a valid ID from your recent pickup requests or waste reports.
          </small>

        </section>
      )}

    </div>
  );
}

export default ComplaintTrackingPage;