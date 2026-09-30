import { useMemo, useState } from "react";
import "../styles/climate/climate.css";

const scenarios = [
  {
    id: "baseline",
    name: "Current Baseline",
    description: "Current lifecycle assumptions",
  },
  {
    id: "recycled",
    name: "Higher Recycled Material",
    description: "Increase recycled material input",
  },
  {
    id: "local",
    name: "Local Manufacturing",
    description: "Reduce transport distance",
  },
  {
    id: "circular",
    name: "Circular End-of-Life",
    description: "Increase reuse and recycling",
  },
];

function ClimateLabPage() {
  const [scenario, setScenario] = useState("baseline");

  const [recycledMaterial, setRecycledMaterial] = useState(25);
  const [transportReduction, setTransportReduction] = useState(20);
  const [recyclingRate, setRecyclingRate] = useState(35);

  const results = useMemo(() => {
    let water = 2700;
    let emissions = 8.4;
    let waste = 0.84;
    let landfill = 58;

    if (scenario === "recycled") {
      water -= recycledMaterial * 8;
      emissions -= recycledMaterial * 0.045;
      waste -= recycledMaterial * 0.006;
      landfill -= recycledMaterial * 0.3;
    }

    if (scenario === "local") {
      emissions -= transportReduction * 0.035;
    }

    if (scenario === "circular") {
      waste -= recyclingRate * 0.009;
      landfill -= recyclingRate * 0.55;
      emissions -= recyclingRate * 0.025;
    }

    if (scenario === "recycled") {
      water = Math.max(water, 500);
      emissions = Math.max(emissions, 2);
      waste = Math.max(waste, 0.15);
      landfill = Math.max(landfill, 10);
    }

    if (scenario === "local") {
      emissions = Math.max(emissions, 2);
    }

    if (scenario === "circular") {
      waste = Math.max(waste, 0.1);
      landfill = Math.max(landfill, 5);
      emissions = Math.max(emissions, 2);
    }

    return {
      water: Math.round(water),
      emissions: Number(emissions.toFixed(1)),
      waste: Number(waste.toFixed(2)),
      landfill: Math.round(landfill),
    };
  }, [
    scenario,
    recycledMaterial,
    transportReduction,
    recyclingRate,
  ]);

  const baseline = {
    water: 2700,
    emissions: 8.4,
    waste: 0.84,
    landfill: 58,
  };

  const getChange = (current, base) => {
    const change = ((current - base) / base) * 100;

    return `${change > 0 ? "+" : ""}${change.toFixed(0)}%`;
  };

  return (
    <div className="page climate-lab-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            ENVIRONMENTAL MODELLING
          </div>

          <h1>
            Climate Lab
          </h1>

          <p>
            Explore how different lifecycle assumptions
            can change environmental outcomes.
          </p>
        </div>

        <div className="climate-status">
          <span className="status-dot" />
          MODELLED SCENARIO
        </div>

      </div>

      {/* =========================
          INTRO
      ========================= */}

      <section className="climate-intro">

        <div>
          <div className="eyebrow">
            WHAT-IF ANALYSIS
          </div>

          <h2>
            What changes when the lifecycle changes?
          </h2>

          <p>
            Adjust the scenario variables to explore
            modelled environmental outcomes. These values
            are simulations, not verified measurements.
          </p>
        </div>

        <div className="modelled-label">
          MODELLED
        </div>

      </section>

      {/* =========================
          SCENARIO SELECTOR
      ========================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <div className="eyebrow">
              SCENARIO
            </div>

            <h2>
              Select a lifecycle scenario
            </h2>

            <p>
              Choose an assumption set for the simulation.
            </p>
          </div>

        </div>

        <div className="scenario-grid">

          {scenarios.map((item) => (

            <button
              key={item.id}
              type="button"
              className={`scenario-card ${
                scenario === item.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => setScenario(item.id)}
            >

              <div className="scenario-number">
                {item.id === "baseline" && "01"}
                {item.id === "recycled" && "02"}
                {item.id === "local" && "03"}
                {item.id === "circular" && "04"}
              </div>

              <strong>
                {item.name}
              </strong>

              <span>
                {item.description}
              </span>

            </button>

          ))}

        </div>

      </section>

      {/* =========================
          CONTROLS
      ========================= */}

      <div className="climate-grid">

        <section className="panel">

          <div className="panel-heading">

            <div>
              <div className="eyebrow">
                MODEL VARIABLES
              </div>

              <h2>
                Adjust assumptions
              </h2>
            </div>

          </div>

          <div className="scenario-controls">

            {/* RECYCLED MATERIAL */}

            <div className="scenario-control">

              <div className="control-header">

                <div>
                  <strong>
                    Recycled Material
                  </strong>

                  <span>
                    Percentage of material replaced
                    with recycled input
                  </span>
                </div>

                <b>
                  {recycledMaterial}%
                </b>

              </div>

              <input
                type="range"
                min="0"
                max="80"
                value={recycledMaterial}
                onChange={(e) =>
                  setRecycledMaterial(
                    Number(e.target.value)
                  )
                }
              />

              <div className="range-labels">
                <span>0%</span>
                <span>80%</span>
              </div>

            </div>

            {/* TRANSPORT */}

            <div className="scenario-control">

              <div className="control-header">

                <div>
                  <strong>
                    Transport Reduction
                  </strong>

                  <span>
                    Assumed reduction in transport
                    distance
                  </span>
                </div>

                <b>
                  {transportReduction}%
                </b>

              </div>

              <input
                type="range"
                min="0"
                max="80"
                value={transportReduction}
                onChange={(e) =>
                  setTransportReduction(
                    Number(e.target.value)
                  )
                }
              />

              <div className="range-labels">
                <span>0%</span>
                <span>80%</span>
              </div>

            </div>

            {/* RECYCLING */}

            <div className="scenario-control">

              <div className="control-header">

                <div>
                  <strong>
                    Recycling Rate
                  </strong>

                  <span>
                    Assumed share diverted to
                    recycling
                  </span>
                </div>

                <b>
                  {recyclingRate}%
                </b>

              </div>

              <input
                type="range"
                min="0"
                max="90"
                value={recyclingRate}
                onChange={(e) =>
                  setRecyclingRate(
                    Number(e.target.value)
                  )
                }
              />

              <div className="range-labels">
                <span>0%</span>
                <span>90%</span>
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            SCENARIO SUMMARY
        ========================= */}

        <section className="panel scenario-summary">

          <div className="eyebrow">
            ACTIVE SCENARIO
          </div>

          <h2>
            {
              scenarios.find(
                (item) => item.id === scenario
              )?.name
            }
          </h2>

          <p>
            {
              scenarios.find(
                (item) => item.id === scenario
              )?.description
            }
          </p>

          <div className="assumption-list">

            <div>
              <span>
                Recycled material
              </span>

              <strong>
                {recycledMaterial}%
              </strong>
            </div>

            <div>
              <span>
                Transport reduction
              </span>

              <strong>
                {transportReduction}%
              </strong>
            </div>

            <div>
              <span>
                Recycling rate
              </span>

              <strong>
                {recyclingRate}%
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* =========================
          RESULTS
      ========================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <div className="eyebrow">
              SIMULATED OUTCOMES
            </div>

            <h2>
              Environmental indicators
            </h2>

            <p>
              Comparison against the current baseline.
            </p>
          </div>

          <span className="dashboard-badge">
            MODELLED
          </span>

        </div>

        <div className="climate-results">

          {/* WATER */}

          <div className="climate-result">

            <span>
              WATER USE
            </span>

            <strong>
              {results.water.toLocaleString()}
            </strong>

            <small>
              litres / product
            </small>

            <div className="result-change">
              {getChange(
                results.water,
                baseline.water
              )}
            </div>

          </div>

          {/* EMISSIONS */}

          <div className="climate-result">

            <span>
              GHG EMISSIONS
            </span>

            <strong>
              {results.emissions}
            </strong>

            <small>
              kg CO₂e / product
            </small>

            <div className="result-change">
              {getChange(
                results.emissions,
                baseline.emissions
              )}
            </div>

          </div>

          {/* WASTE */}

          <div className="climate-result">

            <span>
              PRODUCTION WASTE
            </span>

            <strong>
              {results.waste}
            </strong>

            <small>
              kg / product
            </small>

            <div className="result-change">
              {getChange(
                results.waste,
                baseline.waste
              )}
            </div>

          </div>

          {/* LANDFILL */}

          <div className="climate-result">

            <span>
              LANDFILL SHARE
            </span>

            <strong>
              {results.landfill}%
            </strong>

            <small>
              estimated final outcome
            </small>

            <div className="result-change">
              {getChange(
                results.landfill,
                baseline.landfill
              )}
            </div>

          </div>

        </div>

      </section>

      {/* =========================
          INTERPRETATION
      ========================= */}

      <section className="climate-interpretation">

        <div>

          <div className="eyebrow">
            MODEL INTERPRETATION
          </div>

          <h2>
            Results are scenario estimates.
          </h2>

          <p>
            The Climate Lab is designed to explore
            possible outcomes when lifecycle inputs
            change. Results depend on the assumptions
            selected and should not be interpreted as
            verified environmental measurements.
          </p>

        </div>

        <div className="interpretation-points">

          <div>
            <span>01</span>
            <strong>
              Change assumptions
            </strong>
            <p>
              Adjust material, transport and
              recycling inputs.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>
              Compare outcomes
            </strong>
            <p>
              Observe how indicators change
              against the baseline.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>
              Investigate data
            </strong>
            <p>
              Identify which additional evidence
              would improve the model.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default ClimateLabPage;