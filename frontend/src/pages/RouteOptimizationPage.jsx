import { useMemo, useState } from "react";
import "../styles/route/route.css";

function RouteOptimizationPage() {
  const vehicles = [
    {
      id: "EV-TRUCK-04",
      name: "EV Recovery Truck 04",
      capacity: 500,
      currentLoad: 80,
      type: "Electric",
    },
    {
      id: "TRUCK-12",
      name: "Recovery Truck 12",
      capacity: 750,
      currentLoad: 120,
      type: "Diesel",
    },
    {
      id: "MINI-VAN-07",
      name: "Material Van 07",
      capacity: 300,
      currentLoad: 40,
      type: "Electric",
    },
  ];

  const pickupRequests = [
    {
      id: "PR-2026-1042",
      material: "Textile",
      location: "Civil Lines",
      quantity: 85,
      distance: 8.4,
      priority: "HIGH",
      x: 23,
      y: 31,
    },
    {
      id: "PR-2026-1043",
      material: "Plastic",
      location: "Swaroop Nagar",
      quantity: 120,
      distance: 11.7,
      priority: "MEDIUM",
      x: 47,
      y: 22,
    },
    {
      id: "PR-2026-1044",
      material: "E-waste",
      location: "Kalyanpur",
      quantity: 45,
      distance: 13.2,
      priority: "HIGH",
      x: 72,
      y: 38,
    },
    {
      id: "PR-2026-1045",
      material: "Cardboard",
      location: "Kidwai Nagar",
      quantity: 90,
      distance: 7.9,
      priority: "LOW",
      x: 31,
      y: 69,
    },
    {
      id: "PR-2026-1046",
      material: "Metal",
      location: "Panki",
      quantity: 75,
      distance: 14.5,
      priority: "MEDIUM",
      x: 68,
      y: 72,
    },
    {
      id: "PR-2026-1047",
      material: "Glass",
      location: "Arya Nagar",
      quantity: 60,
      distance: 9.8,
      priority: "LOW",
      x: 52,
      y: 57,
    },
  ];

  const [selectedVehicle, setSelectedVehicle] =
    useState("EV-TRUCK-04");

  const [selectedPickups, setSelectedPickups] = useState([
    "PR-2026-1042",
    "PR-2026-1043",
    "PR-2026-1044",
    "PR-2026-1045",
  ]);

  const [optimized, setOptimized] = useState(false);

  const vehicle =
    vehicles.find(
      (item) => item.id === selectedVehicle
    ) || vehicles[0];

  const selectedPickupData = useMemo(() => {
    return pickupRequests.filter((pickup) =>
      selectedPickups.includes(pickup.id)
    );
  }, [selectedPickups]);

  const totalLoad = selectedPickupData.reduce(
    (sum, pickup) => sum + pickup.quantity,
    0
  );

  const availableCapacity =
    vehicle.capacity - vehicle.currentLoad;

  const capacityPercentage =
    availableCapacity > 0
      ? Math.round(
          (totalLoad / availableCapacity) * 100
        )
      : 100;

  const capacityExceeded =
    totalLoad > availableCapacity;

  const currentDistance =
    selectedPickupData.reduce(
      (sum, pickup) => sum + pickup.distance,
      0
    ) + 14.8;

  const currentTime =
    selectedPickupData.length * 22 + 34;

  const optimizedDistance =
    selectedPickupData.length > 0
      ? Number(
          (
            currentDistance *
            (0.68 - selectedPickupData.length * 0.012)
          ).toFixed(1)
        )
      : 0;

  const optimizedTime =
    selectedPickupData.length > 0
      ? Math.round(currentTime * 0.74)
      : 0;

  const distanceSaved = Math.max(
    0,
    Number(
      (currentDistance - optimizedDistance).toFixed(1)
    )
  );

  const timeSaved = Math.max(
    0,
    currentTime - optimizedTime
  );

  const togglePickup = (id) => {
    setOptimized(false);

    setSelectedPickups((current) => {
      if (current.includes(id)) {
        return current.filter(
          (pickupId) => pickupId !== id
        );
      }

      return [...current, id];
    });
  };

  const selectAll = () => {
    setOptimized(false);

    const allIds = pickupRequests.map(
      (pickup) => pickup.id
    );

    setSelectedPickups(allIds);
  };

  const clearAll = () => {
    setOptimized(false);
    setSelectedPickups([]);
  };

  const optimizeRoute = () => {
    if (selectedPickups.length === 0) {
      alert("Select at least one pickup request.");
      return;
    }

    if (capacityExceeded) {
      alert(
        `Vehicle capacity exceeded. Available capacity is ${availableCapacity} kg.`
      );
      return;
    }

    setOptimized(true);
  };

  const resetRoute = () => {
    setOptimized(false);

    setSelectedPickups([
      "PR-2026-1042",
      "PR-2026-1043",
      "PR-2026-1044",
      "PR-2026-1045",
    ]);

    setSelectedVehicle("EV-TRUCK-04");
  };

  const orderedPickups = useMemo(() => {
    if (!optimized) {
      return selectedPickupData;
    }

    return [...selectedPickupData].sort((a, b) => {
      const priorityValue = {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };

      return (
        priorityValue[a.priority] -
        priorityValue[b.priority]
      );
    });
  }, [optimized, selectedPickupData]);

  const routePoints = orderedPickups
    .map((pickup) => `${pickup.x},${pickup.y}`)
    .join(" ");

  return (
    <div className="page route-optimization-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            ENVIRONMENTAL INTELLIGENCE / ML OPERATIONS
          </div>

          <h1>
            Route Optimization
          </h1>

          <p>
            Use modelled route optimization to organize
            multiple waste pickup requests while considering
            vehicle capacity, distance and pickup priority.
          </p>
        </div>

        <div className="route-model-badge">
          <span />
          MODELLED ROUTE
        </div>

      </div>

      {/* =====================================================
          CONTROL PANEL
      ===================================================== */}

      <section className="panel route-control-panel">

        <div className="route-control-header">

          <div>
            <div className="eyebrow">
              OPTIMIZATION INPUTS
            </div>

            <h2>
              Configure collection run
            </h2>
          </div>

          <div className="route-engine-status">
            <span />
            ML ENGINE READY
          </div>

        </div>

        <div className="route-control-grid">

          {/* VEHICLE */}

          <div className="route-control-block">

            <label>
              Vehicle
            </label>

            <select
              value={selectedVehicle}
              onChange={(e) => {
                setSelectedVehicle(e.target.value);
                setOptimized(false);
              }}
            >
              {vehicles.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.id} — {item.capacity} kg
                </option>
              ))}
            </select>

            <div className="route-vehicle-info">

              <span>
                {vehicle.name}
              </span>

              <small>
                {vehicle.type} · Existing load{" "}
                {vehicle.currentLoad} kg
              </small>

            </div>

          </div>

          {/* CAPACITY */}

          <div className="route-control-block">

            <label>
              Available Capacity
            </label>

            <div className="route-capacity-value">
              <strong>
                {availableCapacity}
              </strong>

              <span>
                kg available
              </span>
            </div>

            <div className="route-capacity-bar">

              <div
                style={{
                  width: `${Math.min(
                    capacityPercentage,
                    100
                  )}%`,
                }}
              />

            </div>

            <small
              className={
                capacityExceeded
                  ? "capacity-warning"
                  : ""
              }
            >
              Selected pickup load: {totalLoad} kg
              {capacityExceeded &&
                " · Capacity exceeded"}
            </small>

          </div>

          {/* PICKUP COUNT */}

          <div className="route-control-block">

            <label>
              Pickup Requests
            </label>

            <div className="route-pickup-count">
              <strong>
                {selectedPickups.length}
              </strong>

              <span>
                selected
              </span>
            </div>

            <div className="route-selection-actions">

              <button
                type="button"
                onClick={selectAll}
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearAll}
              >
                Clear
              </button>

            </div>

          </div>

        </div>

        <div className="route-control-actions">

          <button
            type="button"
            className="dark-button route-optimize-button"
            onClick={optimizeRoute}
          >
            {optimized
              ? "✓ Route Optimized"
              : "Optimize Route →"}
          </button>

          <button
            type="button"
            className="light-button"
            onClick={resetRoute}
          >
            Reset
          </button>

        </div>

      </section>

      {/* =====================================================
          BEFORE / AFTER METRICS
      ===================================================== */}

      <section className="route-metrics-section">

        <div className="route-metric-heading">

          <div>
            <div className="eyebrow">
              ROUTE PERFORMANCE
            </div>

            <h2>
              Before vs modelled route
            </h2>
          </div>

          {optimized && (
            <div className="route-improvement-badge">
              {distanceSaved} km distance reduction
            </div>
          )}

        </div>

        <div className="route-metrics-grid">

          <div className="route-metric-card">

            <span>
              TOTAL DISTANCE
            </span>

            <div className="route-metric-comparison">

              <div>
                <small>
                  CURRENT
                </small>

                <strong>
                  {currentDistance.toFixed(1)} km
                </strong>
              </div>

              <div className="metric-arrow">
                →
              </div>

              <div>
                <small>
                  OPTIMIZED
                </small>

                <strong>
                  {optimized
                    ? `${optimizedDistance} km`
                    : "—"}
                </strong>
              </div>

            </div>

            {optimized && (
              <p>
                ↓ {distanceSaved} km modelled reduction
              </p>
            )}

          </div>

          <div className="route-metric-card">

            <span>
              ESTIMATED TIME
            </span>

            <div className="route-metric-comparison">

              <div>
                <small>
                  CURRENT
                </small>

                <strong>
                  {currentTime} min
                </strong>
              </div>

              <div className="metric-arrow">
                →
              </div>

              <div>
                <small>
                  OPTIMIZED
                </small>

                <strong>
                  {optimized
                    ? `${optimizedTime} min`
                    : "—"}
                </strong>
              </div>

            </div>

            {optimized && (
              <p>
                ↓ {timeSaved} min modelled reduction
              </p>
            )}

          </div>

          <div className="route-metric-card">

            <span>
              PICKUP STOPS
            </span>

            <div className="route-metric-big">
              {selectedPickups.length}
            </div>

            <p>
              {selectedPickups.length === 0
                ? "No requests selected"
                : "Collection points included"}
            </p>

          </div>

          <div className="route-metric-card">

            <span>
              VEHICLE LOAD
            </span>

            <div className="route-metric-big">
              {totalLoad}
              <small> kg</small>
            </div>

            <p>
              of {availableCapacity} kg available
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN ROUTE AREA
      ===================================================== */}

      <div className="route-main-grid">

        {/* ===================================================
            PICKUP REQUESTS
        =================================================== */}

        <section className="panel route-pickups-panel">

          <div className="route-panel-heading">

            <div>
              <div className="eyebrow">
                PICKUP QUEUE
              </div>

              <h2>
                Select collection requests
              </h2>
            </div>

            <span>
              {selectedPickups.length}/
              {pickupRequests.length}
            </span>

          </div>

          <div className="route-pickup-list">

            {pickupRequests.map((pickup) => {

              const selected =
                selectedPickups.includes(
                  pickup.id
                );

              return (
                <button
                  type="button"
                  key={pickup.id}
                  className={`route-pickup-item ${
                    selected ? "selected" : ""
                  }`}
                  onClick={() =>
                    togglePickup(pickup.id)
                  }
                >

                  <div className="route-pickup-checkbox">
                    {selected ? "✓" : ""}
                  </div>

                  <div className="route-pickup-info">

                    <div className="route-pickup-top">

                      <strong>
                        {pickup.id}
                      </strong>

                      <span
                        className={`priority-${pickup.priority.toLowerCase()}`}
                      >
                        {pickup.priority}
                      </span>

                    </div>

                    <h3>
                      {pickup.material}
                    </h3>

                    <p>
                      ⌖ {pickup.location}
                    </p>

                  </div>

                  <div className="route-pickup-weight">

                    <strong>
                      {pickup.quantity} kg
                    </strong>

                    <small>
                      {pickup.distance} km
                    </small>

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            ROUTE MAP
        =================================================== */}

        <section className="panel route-map-panel">

          <div className="route-map-heading">

            <div>
              <div className="eyebrow">
                COLLECTION NETWORK
              </div>

              <h2>
                {optimized
                  ? "Optimized collection route"
                  : "Current pickup network"}
              </h2>
            </div>

            <div className="route-map-status">

              <span
                className={
                  optimized ? "optimized" : ""
                }
              />

              {optimized
                ? "OPTIMIZED"
                : "PLANNING"}

            </div>

          </div>

          <div className="route-map">

            <div className="route-map-grid" />

            <div className="route-map-road road-one" />
            <div className="route-map-road road-two" />
            <div className="route-map-road road-three" />

            {/* ROUTE */}

            {optimized && (
              <svg
                className="route-path-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >

                <polyline
                  points={`12,78 ${routePoints} 88,20`}
                  fill="none"
                  stroke="#304b38"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />

              </svg>
            )}

            {/* DEPOT */}

            <div
              className="route-map-node depot-node"
              style={{
                left: "12%",
                top: "78%",
              }}
            >

              <div className="route-node-marker">
                D
              </div>

              <div className="route-node-label">
                <strong>DEPOT</strong>
                <span>Vehicle start</span>
              </div>

            </div>

            {/* PICKUPS */}

            {pickupRequests.map((pickup) => {

              const selected =
                selectedPickups.includes(
                  pickup.id
                );

              if (!selected) return null;

              const order =
                orderedPickups.findIndex(
                  (item) =>
                    item.id === pickup.id
                ) + 1;

              return (
                <div
                  key={pickup.id}
                  className={`route-map-node pickup-node ${
                    optimized ? "optimized-node" : ""
                  }`}
                  style={{
                    left: `${pickup.x}%`,
                    top: `${pickup.y}%`,
                  }}
                >

                  <div className="route-node-marker">
                    {optimized ? order : "P"}
                  </div>

                  <div className="route-node-label">
                    <strong>
                      {pickup.material}
                    </strong>

                    <span>
                      {pickup.quantity} kg
                    </span>
                  </div>

                </div>
              );
            })}

            {/* DESTINATION */}

            <div
              className="route-map-node destination-node"
              style={{
                left: "88%",
                top: "20%",
              }}
            >

              <div className="route-node-marker">
                R
              </div>

              <div className="route-node-label">
                <strong>
                  RECOVERY FACILITY
                </strong>

                <span>
                  Final destination
                </span>
              </div>

            </div>

          </div>

          <div className="route-map-legend">

            <div>
              <span className="legend-depot" />
              Depot
            </div>

            <div>
              <span className="legend-pickup" />
              Pickup
            </div>

            <div>
              <span className="legend-destination" />
              Recovery facility
            </div>

            <div>
              <span className="legend-route" />
              Modelled route
            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          OPTIMIZED ORDER
      ===================================================== */}

      {optimized && (

        <section className="panel optimized-order-panel">

          <div className="route-panel-heading">

            <div>
              <div className="eyebrow">
                MODEL OUTPUT
              </div>

              <h2>
                Recommended stop sequence
              </h2>

              <p>
                This is a modelled recommendation based
                on the selected requests and vehicle
                constraints.
              </p>
            </div>

            <div className="model-confidence">
              <span>MODEL STATUS</span>
              <strong>
                READY FOR REVIEW
              </strong>
            </div>

          </div>

          <div className="optimized-sequence">

            <div className="sequence-stop depot-sequence">

              <span>START</span>

              <strong>
                Depot
              </strong>

            </div>

            {orderedPickups.map(
              (pickup, index) => (
                <div
                  className="sequence-wrapper"
                  key={pickup.id}
                >

                  <div className="sequence-line" />

                  <div className="sequence-stop">

                    <span>
                      STOP {index + 1}
                    </span>

                    <strong>
                      {pickup.material}
                    </strong>

                    <small>
                      {pickup.location} ·{" "}
                      {pickup.quantity} kg
                    </small>

                  </div>

                </div>
              )
            )}

            <div className="sequence-wrapper">

              <div className="sequence-line" />

              <div className="sequence-stop destination-sequence">

                <span>
                  END
                </span>

                <strong>
                  Recovery Facility
                </strong>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          METHODOLOGY
      ===================================================== */}

      <section className="route-methodology">

        <div>

          <div className="eyebrow">
            OPTIMIZATION METHODOLOGY
          </div>

          <h3>
            What the model considers
          </h3>

        </div>

        <div className="route-method-grid">

          <div>
            <span>01</span>
            <strong>Distance</strong>
            <p>
              Reduces unnecessary travel between
              selected collection points.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Capacity</strong>
            <p>
              Keeps the selected material load within
              vehicle capacity.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>Priority</strong>
            <p>
              Allows higher-priority pickup requests
              to influence the sequence.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>Destination</strong>
            <p>
              Includes the recovery facility as the
              final route destination.
            </p>
          </div>

        </div>

      </section>

      <div className="route-disclaimer">

        <strong>
          Modelled estimate
        </strong>

        <p>
          Route distances and time savings shown in this
          frontend demo are illustrative model outputs.
          They are not live traffic measurements or
          guaranteed optimal routes. A production version
          should calculate routes using verified geographic
          data, live constraints and the backend ML/route
          optimization service.
        </p>

      </div>

    </div>
  );
}

export default RouteOptimizationPage;