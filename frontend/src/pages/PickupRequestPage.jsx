import { useState } from "react";

function PickupRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    wasteType: "",
    quantity: "",
    unit: "kg",
    location: "",
    preferredDate: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestId = `PR-2026-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    localStorage.setItem(
      "ecoversePickupRequest",
      JSON.stringify({
        requestId,
        ...form,
        status: "REQUESTED",
      })
    );

    setSubmitted(true);
  };

  if (submitted) {
    const request = JSON.parse(
      localStorage.getItem("ecoversePickupRequest")
    );

    return (
      <div className="page pickup-page">
        <section className="pickup-success panel">
          <div className="eyebrow">PICKUP REQUEST CREATED</div>

          <div className="pickup-success-icon">✓</div>

          <h1>Pickup request submitted.</h1>

          <p>
            Your waste pickup request has been registered
            and is waiting for assignment.
          </p>

          <div className="pickup-request-id">
            <span>REQUEST ID</span>
            <strong>{request?.requestId}</strong>
          </div>

          <div className="pickup-status-flow">
            <div className="pickup-status active">
              <span>01</span>
              <strong>Requested</strong>
              <small>Submitted</small>
            </div>

            <div className="pickup-line" />

            <div className="pickup-status">
              <span>02</span>
              <strong>Assigned</strong>
              <small>Awaiting operator</small>
            </div>

            <div className="pickup-line" />

            <div className="pickup-status">
              <span>03</span>
              <strong>Picked Up</strong>
              <small>Collection</small>
            </div>

            <div className="pickup-line" />

            <div className="pickup-status">
              <span>04</span>
              <strong>Received</strong>
              <small>Destination</small>
            </div>
          </div>

          <button
            className="dark-button"
            onClick={() => setSubmitted(false)}
          >
            View Request Details →
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page pickup-page">

      <div className="page-header">
        <div>
          <div className="eyebrow">
            MATERIAL RECOVERY
          </div>

          <h1>Request Waste Pickup</h1>

          <p>
            Submit a pickup request for recyclable,
            recoverable or other material requiring
            collection.
          </p>
        </div>

        <div className="report-user-badge">
          PICKUP REQUEST
        </div>
      </div>

      <div className="pickup-grid">

        <section className="panel pickup-form-panel">

          <div className="panel-heading">
            <div>
              <div className="eyebrow">NEW REQUEST</div>

              <h2>Pickup information</h2>

              <p>
                Provide the material and collection details.
              </p>
            </div>
          </div>

          <form
            className="pickup-form"
            onSubmit={handleSubmit}
          >

            <div className="pickup-form-row">

              <label>
                Waste / Material Type

                <select
                  name="wasteType"
                  value={form.wasteType}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select material
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

                  <option value="Cosmetics">
                    Cosmetics
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
                Quantity

                <div className="quantity-input">
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 25"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                  >
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
              />
            </label>

            <label>
              Additional Information

              <textarea
                name="description"
                rows="6"
                placeholder="Describe the material, packaging, accessibility or any other useful information..."
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <div className="pickup-note">
              <strong>Before submitting</strong>

              <p>
                Pickup availability and assignment will be
                confirmed by the waste operator. The request
                does not automatically confirm collection.
              </p>
            </div>

            <button
              type="submit"
              className="dark-button pickup-submit"
            >
              Submit Pickup Request →
            </button>

          </form>
        </section>

        <aside>

          <section className="panel pickup-info-panel">

            <div className="eyebrow">
              REQUEST FLOW
            </div>

            <h2>What happens next?</h2>

            <div className="pickup-process">

              <div>
                <span>01</span>
                <div>
                  <strong>REQUESTED</strong>
                  <p>
                    Your pickup request enters the system.
                  </p>
                </div>
              </div>

              <div>
                <span>02</span>
                <div>
                  <strong>ASSIGNED</strong>
                  <p>
                    A collection operator is assigned.
                  </p>
                </div>
              </div>

              <div>
                <span>03</span>
                <div>
                  <strong>PICKED UP</strong>
                  <p>
                    Material is collected and recorded.
                  </p>
                </div>
              </div>

              <div>
                <span>04</span>
                <div>
                  <strong>TRACKING</strong>
                  <p>
                    Movement can be connected to its
                    waste manifest.
                  </p>
                </div>
              </div>

            </div>

          </section>

          <section className="pickup-intelligence">

            <div className="eyebrow">
              ECOVERSE TRACEABILITY
            </div>

            <h3>
              Pickup is the beginning of the trace.
            </h3>

            <p>
              Once collected, the material can be connected
              to its transporter, destination, treatment and
              final outcome.
            </p>

          </section>

        </aside>

      </div>

    </div>
  );
}

export default PickupRequestPage;