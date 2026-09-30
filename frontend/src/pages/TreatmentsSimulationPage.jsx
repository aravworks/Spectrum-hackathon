import { useMemo, useState } from "react";

const treatmentOptions = {
  Recycling: {
    recovery: 82,
    residual: 18,
    carbonFactor: 0.9,
    methaneFactor: 0.01,
    output: "Recovered material",
  },
  Composting: {
    recovery: 72,
    residual: 28,
    carbonFactor: 0.7,
    methaneFactor: 0.008,
    output: "Compost / organic recovery",
  },
  "Material Recovery": {
    recovery: 76,
    residual: 24,
    carbonFactor: 1.1,
    methaneFactor: 0.012,
    output: "Recovered materials",
  },
  "Energy Recovery": {
    recovery: 64,
    residual: 36,
    carbonFactor: 1.8,
    methaneFactor: 0.006,
    output: "Energy + residual material",
  },
  Landfill: {
    recovery: 8,
    residual: 92,
    carbonFactor: 2.9,
    methaneFactor: 0.06,
    output: "Landfill residue",
  },
};

const wasteCategories = [
  "Food Waste",
  "Textile",
  "Plastic",
  "E-waste",
  "Paper",
  "Mixed Household",
];

function TreatmentSimulationPage() {
  const [category, setCategory] =
    useState("Food Waste");

  const [quantity, setQuantity] =
    useState(1000);

  const [treatment, setTreatment] =
    useState("Composting");

  const [simulationRun, setSimulationRun] =
    useState(false);

  const selectedTreatment =
    treatmentOptions[treatment];

  const results = useMemo(() => {
    const recovered =
      quantity *
      (selectedTreatment.recovery / 100);

    const residual =
      quantity *
      (selectedTreatment.residual / 100);

    const carbonImpact =
      (quantity *
        selectedTreatment.carbonFactor) /
      1000;

    const methane =
      quantity *
      selectedTreatment.methaneFactor;

    const methaneCO2e =
      (methane * 28) / 1000;

    const totalImpact =
      carbonImpact + methaneCO2e;

    const landfillDiversion =
      Math.max(
        0,
        (recovered / quantity) * 100
      );

    return {
      recovered,
      residual,
      carbonImpact,
      methane,
      methaneCO2e,
      totalImpact,
      landfillDiversion,
    };
  }, [quantity, selectedTreatment]);

  const handleRunSimulation = () => {
    setSimulationRun(false);

    setTimeout(() => {
      setSimulationRun(true);
    }, 500);
  };

  return (
    <div className="page treatment-simulation-page">

      {/* HEADER */}

      <div className="page-header treatment-header">
        <div>
          <div className="eyebrow">
            WASTE INTELLIGENCE / TREATMENT MODELLING
          </div>

          <h1>Treatment Simulation</h1>

          <p>
            Simulate how a waste stream may behave under
            different treatment pathways and examine
            recovery, residuals and environmental impact.
          </p>
        </div>

        <div className="treatment-status">
          <span />
          MODELLED SIMULATION
        </div>
      </div>

      {/* INPUTS */}

      <section className="panel treatment-input-panel">

        <div className="treatment-section-heading">
          <div>
            <div className="eyebrow">
              SIMULATION INPUTS
            </div>

            <h2>Configure treatment scenario</h2>
          </div>

          <div className="simulation-id">
            SIM-{category
              .replace(/\s/g, "")
              .slice(0, 5)
              .toUpperCase()}-2026
          </div>
        </div>

        <div className="treatment-input-grid">

          <div className="treatment-input">
            <label>WASTE CATEGORY</label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {wasteCategories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="treatment-input">

            <div className="treatment-label-row">
              <label>INPUT QUANTITY</label>

              <strong>
                {quantity} kg
              </strong>
            </div>

            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Number(event.target.value)
                )
              }
            />

            <div className="range-labels">
              <span>100 kg</span>
              <span>5,000 kg</span>
            </div>
          </div>

          <div className="treatment-input">
            <label>TREATMENT PATHWAY</label>

            <select
              value={treatment}
              onChange={(event) =>
                setTreatment(event.target.value)
              }
            >
              {Object.keys(treatmentOptions).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            className="treatment-run-button"
            onClick={handleRunSimulation}
          >
            {simulationRun
              ? "RUN AGAIN"
              : "RUN SIMULATION"}
          </button>

        </div>
      </section>

      {/* FLOW */}

      <section className="panel treatment-flow-panel">

        <div className="treatment-section-heading">

          <div>
            <div className="eyebrow">
              MATERIAL FLOW
            </div>

            <h2>
              Waste treatment pathway
            </h2>
          </div>

          <span className="treatment-flow-label">
            {treatment}
          </span>

        </div>

        <div className="treatment-flow">

          <div className="treatment-flow-node">

            <span className="flow-node-number">
              01
            </span>

            <strong>
              Waste Input
            </strong>

            <b>
              {quantity} kg
            </b>

            <small>
              {category}
            </small>

          </div>

          <div className="treatment-flow-arrow">
            →
          </div>

          <div className="treatment-flow-node active">

            <span className="flow-node-number">
              02
            </span>

            <strong>
              Treatment
            </strong>

            <b>
              {treatment}
            </b>

            <small>
              Processing stage
            </small>

          </div>

          <div className="treatment-flow-arrow">
            →
          </div>

          <div className="treatment-flow-node">

            <span className="flow-node-number">
              03
            </span>

            <strong>
              Recovery
            </strong>

            <b>
              {results.recovered.toFixed(0)} kg
            </b>

            <small>
              {selectedTreatment.output}
            </small>

          </div>

          <div className="treatment-flow-arrow">
            →
          </div>

          <div className="treatment-flow-node residual-node">

            <span className="flow-node-number">
              04
            </span>

            <strong>
              Residual
            </strong>

            <b>
              {results.residual.toFixed(0)} kg
            </b>

            <small>
              Remaining material
            </small>

          </div>

        </div>
      </section>

      {/* KPI RESULTS */}

      <section className="treatment-kpi-grid">

        <div className="treatment-kpi-card">
          <span>RECOVERED MATERIAL</span>

          <strong>
            {results.recovered.toFixed(0)}
          </strong>

          <small>kg</small>

          <p>
            Estimated material recovered through
            the selected treatment.
          </p>
        </div>

        <div className="treatment-kpi-card">
          <span>RECOVERY RATE</span>

          <strong>
            {selectedTreatment.recovery}%
          </strong>

          <small>of input</small>

          <p>
            Modelled recovery performance.
          </p>
        </div>

        <div className="treatment-kpi-card">
          <span>RESIDUAL WASTE</span>

          <strong>
            {results.residual.toFixed(0)}
          </strong>

          <small>kg</small>

          <p>
            Material remaining after treatment.
          </p>
        </div>

        <div className="treatment-kpi-card">
          <span>LANDFILL DIVERSION</span>

          <strong>
            {results.landfillDiversion.toFixed(1)}%
          </strong>

          <small>estimated</small>

          <p>
            Potentially diverted from landfill.
          </p>
        </div>

      </section>

      {/* ENVIRONMENTAL IMPACT */}

      <div className="treatment-impact-grid">

        <section className="panel treatment-impact-panel">

          <div className="treatment-section-heading">

            <div>
              <div className="eyebrow">
                ENVIRONMENTAL IMPACT
              </div>

              <h2>
                Treatment consequences
              </h2>
            </div>

            <span className="modelled-label">
              MODELLED
            </span>

          </div>

          <div className="impact-result-list">

            <div className="impact-result">
              <div>
                <span>
                  CARBON IMPACT
                </span>

                <strong>
                  {results.carbonImpact.toFixed(2)}
                  {" "}t CO₂e
                </strong>
              </div>

              <div className="impact-bar">
                <span
                  style={{
                    width: `${Math.min(
                      results.carbonImpact * 18,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="impact-result">
              <div>
                <span>
                  METHANE GENERATION
                </span>

                <strong>
                  {results.methane.toFixed(1)}
                  {" "}kg CH₄
                </strong>
              </div>

              <div className="impact-bar">
                <span
                  style={{
                    width: `${Math.min(
                      results.methane * 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="impact-result">
              <div>
                <span>
                  METHANE CO₂e
                </span>

                <strong>
                  {results.methaneCO2e.toFixed(2)}
                  {" "}t CO₂e
                </strong>
              </div>

              <div className="impact-bar">
                <span
                  style={{
                    width: `${Math.min(
                      results.methaneCO2e * 30,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="impact-result">
              <div>
                <span>
                  TOTAL MODELLED IMPACT
                </span>

                <strong>
                  {results.totalImpact.toFixed(2)}
                  {" "}t CO₂e
                </strong>
              </div>

              <div className="impact-bar">
                <span
                  style={{
                    width: `${Math.min(
                      results.totalImpact * 18,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>

        </section>

        {/* TREATMENT PROFILE */}

        <section className="panel treatment-profile-panel">

          <div className="treatment-section-heading">

            <div>
              <div className="eyebrow">
                TREATMENT PROFILE
              </div>

              <h2>
                {treatment}
              </h2>
            </div>

          </div>

          <div className="profile-circle">

            <div>
              <strong>
                {selectedTreatment.recovery}%
              </strong>

              <span>
                Recovery
              </span>
            </div>

          </div>

          <div className="profile-stats">

            <div>
              <span>
                RECOVERY
              </span>

              <strong>
                {selectedTreatment.recovery}%
              </strong>
            </div>

            <div>
              <span>
                RESIDUAL
              </span>

              <strong>
                {selectedTreatment.residual}%
              </strong>
            </div>

            <div>
              <span>
                OUTPUT
              </span>

              <strong>
                {selectedTreatment.output}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* ALTERNATIVE TREATMENTS */}

      <section className="panel alternative-treatment-panel">

        <div className="treatment-section-heading">

          <div>
            <div className="eyebrow">
              PATHWAY COMPARISON
            </div>

            <h2>
              Alternative treatment scenarios
            </h2>

            <p>
              Compare modelled recovery outcomes
              across treatment pathways.
            </p>
          </div>

        </div>

        <div className="alternative-treatment-grid">

          {Object.entries(treatmentOptions).map(
            ([name, option]) => {

              const recovered =
                quantity *
                (option.recovery / 100);

              return (
                <button
                  type="button"
                  key={name}
                  className={
                    name === treatment
                      ? "alternative-card active"
                      : "alternative-card"
                  }
                  onClick={() =>
                    setTreatment(name)
                  }
                >
                  <span>
                    {name === treatment
                      ? "SELECTED"
                      : "SCENARIO"}
                  </span>

                  <strong>
                    {name}
                  </strong>

                  <div>
                    <small>
                      Recovery
                    </small>

                    <b>
                      {option.recovery}%
                    </b>
                  </div>

                  <div>
                    <small>
                      Recovered
                    </small>

                    <b>
                      {recovered.toFixed(0)} kg
                    </b>
                  </div>
                </button>
              );
            }
          )}

        </div>
      </section>

      {/* INTERPRETATION */}

      <section className="treatment-interpretation">

        <div>
          <div className="eyebrow">
            SIMULATION INTERPRETATION
          </div>

          <h2>
            What does this scenario tell us?
          </h2>
        </div>

        <div className="interpretation-grid">

          <div>
            <span>01</span>

            <strong>
              Material recovery
            </strong>

            <p>
              The model estimates how much of the
              input stream may remain available for
              recovery under the selected pathway.
            </p>
          </div>

          <div>
            <span>02</span>

            <strong>
              Residual generation
            </strong>

            <p>
              Not all incoming material becomes a
              useful output. The remaining fraction
              becomes treatment residual.
            </p>
          </div>

          <div>
            <span>03</span>

            <strong>
              Environmental impact
            </strong>

            <p>
              Treatment pathways can produce different
              modelled carbon and methane outcomes.
            </p>
          </div>

          <div>
            <span>04</span>

            <strong>
              Decision support
            </strong>

            <p>
              The simulator can later connect to
              verified waste-manifest and treatment
              facility data.
            </p>
          </div>

        </div>
      </section>

      {/* METHODOLOGY */}

      <section className="treatment-methodology">

        <div>
          <div className="eyebrow">
            METHODOLOGY
          </div>

          <h3>
            How the simulation works
          </h3>
        </div>

        <div className="methodology-steps">

          <div>
            <span>01</span>

            <strong>
              Input
            </strong>

            <p>
              Waste category and quantity are selected.
            </p>
          </div>

          <div>
            <span>02</span>

            <strong>
              Treatment factor
            </strong>

            <p>
              An illustrative treatment profile determines
              recovery and residual fractions.
            </p>
          </div>

          <div>
            <span>03</span>

            <strong>
              Environmental model
            </strong>

            <p>
              Illustrative carbon and methane factors
              estimate climate impact.
            </p>
          </div>

          <div>
            <span>04</span>

            <strong>
              Output
            </strong>

            <p>
              Recovery, residuals and environmental
              indicators are displayed.
            </p>
          </div>

        </div>
      </section>

      {/* DISCLAIMER */}

      <div className="treatment-disclaimer">

        <div className="disclaimer-icon">
          i
        </div>

        <div>
          <strong>
            Modelled simulation — not a treatment
            facility measurement.
          </strong>

          <p>
            The values shown in this frontend are
            illustrative demonstration factors. A
            production ECOVERSE system should use
            verified treatment-facility data, material
            composition, process efficiency, geographic
            conditions and documented environmental
            methodologies.
          </p>
        </div>

      </div>

    </div>
  );
}

export default TreatmentSimulationPage;