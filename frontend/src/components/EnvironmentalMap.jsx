import { useEffect, useState } from "react";

function EnvironmentalMap({
  manifestId = "WM-2026-00204",
  autoTrack = true,
}) {
  const [progress, setProgress] = useState(58);
  const [tracking, setTracking] = useState(autoTrack);

  useEffect(() => {
    if (!tracking) return;

    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 96) {
          return 18;
        }

        return current + 2;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [tracking]);

  const distanceTotal = 61.2;

  const distanceTravelled = (
    distanceTotal *
    (progress / 100)
  ).toFixed(1);

  const distanceRemaining = (
    distanceTotal -
    Number(distanceTravelled)
  ).toFixed(1);

  return (
    <div className="gps-dashboard">

      <div className="gps-dashboard-header">
        <div>
          <div className="eyebrow">
            LIVE TRANSPORT MONITORING
          </div>

          <h2>Waste Movement Tracking</h2>

          <p>Manifest {manifestId}</p>
        </div>

        <div className="gps-live-status">
          <span className="gps-live-dot" />
          {tracking ? "GPS LIVE" : "GPS PAUSED"}
        </div>
      </div>

      <div className="gps-visual-map">

        <div className="map-grid" />

        <div className="map-label map-label-start">
          PICKUP
        </div>

        <div className="map-label map-label-end">
          DESTINATION
        </div>

        <svg
          className="gps-route-svg"
          viewBox="0 0 1000 430"
          preserveAspectRatio="none"
        >
          <path
            d="
              M 120 90
              C 220 130, 270 220, 370 190
              S 500 110, 570 210
              S 700 350, 850 300
            "
            fill="none"
            stroke="#d6ded7"
            strokeWidth="14"
            strokeLinecap="round"
          />

          <path
            d="
              M 120 90
              C 220 130, 270 220, 370 190
              S 500 110, 570 210
              S 700 350, 850 300
            "
            fill="none"
            stroke="#344b3b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />
        </svg>

        <div className="gps-location pickup-location">

          <div className="location-pulse">
            <span />
          </div>

          <div className="location-card">
            <strong>Waste Generated</strong>
            <small>Pickup location</small>
          </div>

        </div>

        <div
          className="gps-vehicle"
          style={{
            left: `${18 + progress * 0.67}%`,
          }}
        >

          <div className="vehicle-pulse" />

          <div className="vehicle-icon">
            🚛
          </div>

          <div className="vehicle-label">
            <strong>E-Waste Transporter</strong>
            <span>GPS active</span>
          </div>

        </div>

        <div className="gps-location destination-location">

          <div className="location-pulse destination">
            <span />
          </div>

          <div className="location-card">
            <strong>Recovery Facility</strong>
            <small>Destination</small>
          </div>

        </div>

      </div>

      <div className="gps-data-grid">

        <div className="gps-data-card">
          <span>STATUS</span>
          <strong>
            {tracking ? "IN TRANSIT" : "PAUSED"}
          </strong>
        </div>

        <div className="gps-data-card">
          <span>ROUTE PROGRESS</span>
          <strong>{progress}%</strong>
        </div>

        <div className="gps-data-card">
          <span>DISTANCE TRAVELLED</span>
          <strong>{distanceTravelled} km</strong>
        </div>

        <div className="gps-data-card">
          <span>DISTANCE REMAINING</span>
          <strong>{distanceRemaining} km</strong>
        </div>

      </div>

      <div className="gps-control-bar">

        <button
          type="button"
          className="gps-button"
          onClick={() => setTracking((value) => !value)}
        >
          {tracking ? "Pause Tracking" : "Resume Tracking"}
        </button>

        <button
          type="button"
          className="gps-button secondary"
          onClick={() => setProgress(18)}
        >
          Reset Route
        </button>

        <div className="gps-last-update">
          <span />
          Last GPS update: just now
        </div>

      </div>

    </div>
  );
}

export default EnvironmentalMap;