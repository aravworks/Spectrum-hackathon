import { useState } from "react";

function ComplaintTrackingPage() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);

  const sampleComplaints = {
    "CMP-2026-1042": {
      id: "CMP-2026-1042",
      type: "Missed Pickup",
      category: "Plastic / Packaging",
      location: "Civil Lines, Kanpur",
      submitted: "30 Sep 2026",
      description:
        "Scheduled waste pickup was not completed at the requested location.",
      status: "UNDER REVIEW",
      priority: "MEDIUM",
      assignedTo: "GreenRoute Operations",
      updated: "30 Sep 2026, 09:42 AM",
    },

    "CMP-2026-1043": {
      id: "CMP-2026-1043",
      type: "Damaged Material",
      category: "Electronics / E-waste",
      location: "Swaroop Nagar, Kanpur",
      submitted: "29 Sep 2026",
      description:
        "Material was collected but the quantity recorded at pickup appears different from the submitted request.",
      status: "RESOLVED",
      priority: "LOW",
      assignedTo: "Recovery Operations",
      updated: "30 Sep 2026, 08:15 AM",
    },
  };

  const handleTrack = (e) => {
    e.preventDefault();

    const id = complaintId.trim().toUpperCase();

    setComplaint(sampleComplaints[id] || null);
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
          Example: CMP-2026-1042
        </p>

        <form
          className="complaint-search-form"
          onSubmit={handleTrack}
        >

          <input
            type="text"
            placeholder="CMP-2026-1042"
            value={complaintId}
            onChange={(e) =>
              setComplaintId(e.target.value)
            }
          />

          <button
            type="submit"
            className="dark-button"
          >
            Track Complaint →
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
      {complaintId && !complaint && (
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
            Try CMP-2026-1042 or CMP-2026-1043 for the
            demo records.
          </small>

        </section>
      )}

    </div>
  );
}

export default ComplaintTrackingPage;