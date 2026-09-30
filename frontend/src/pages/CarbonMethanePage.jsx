import { useMemo, useState } from "react";
import "../styles/carbon-methane/carbon-methane.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CarbonMethanePage() {
  const wasteOptions = {
    Textile: {
      waste: 680,
      landfillFactor: 0.08,
      carbonFactor: 2.1,
      methaneFactor: 0.012,
    },
    "Food Waste": {
      waste: 680,
      landfillFactor: 0.72,
      carbonFactor: 1.9,
      methaneFactor: 0.061,
    },
    Plastic: {
      waste: 680,
      landfillFactor: 0.18,
      carbonFactor: 3.4,
      methaneFactor: 0.004,
    },
    "E-waste": {
      waste: 680,
      landfillFactor: 0.12,
      carbonFactor: 4.6,
      methaneFactor: 0.002,
    },
    "Mixed Household": {
      waste: 680,
      landfillFactor: 0.46,
      carbonFactor: 2.7,
      methaneFactor: 0.034,
    },
  };

  const [category, setCategory] = useState("Food Waste");
  const [quantity, setQuantity] = useState(680);
  const [landfillRate, setLandfillRate] = useState(
    wasteOptions["Food Waste"].landfillFactor * 100
  );
  const [reduction, setReduction] = useState(40);

  const selected = wasteOptions[category];

  const calculations = useMemo(() => {
    const landfillWaste = quantity * (landfillRate / 100);

    const carbonFootprint =
      (quantity * selected.carbonFactor) / 1000;

    const methaneGenerated =
      landfillWaste * selected.methaneFactor;

    const methaneCO2e =
      methaneGenerated * 28;

    const totalClimateImpact =
      carbonFootprint + methaneCO2e;

    const reducedMethane =
      methaneCO2e * (1 - reduction / 100);

    const scenarioImpact =
      carbonFootprint + reducedMethane;

    const avoidedImpact =
      totalClimateImpact - scenarioImpact;

    return {
      landfillWaste,
      carbonFootprint,
      methaneGenerated,
      methaneCO2e,
      totalClimateImpact,
      scenarioImpact,
      avoidedImpact,
    };
  }, [category, quantity, landfillRate, reduction, selected]);

  const chartData = [
    {
      stage: "Raw Material",
      emissions: calculations.carbonFootprint * 0.22,
    },
    {
      stage: "Manufacturing",
      emissions: calculations.carbonFootprint * 0.38,
    },
    {
      stage: "Transport",
      emissions: calculations.carbonFootprint * 0.11,
    },
    {
      stage: "Use",
      emissions: calculations.carbonFootprint * 0.08,
    },
    {
      stage: "End-of-Life",
      emissions:
        calculations.carbonFootprint * 0.21 +
        calculations.methaneCO2e,
    },
  ];

  const handleCategoryChange = (value) => {
    setCategory(value);
    setLandfillRate(
      wasteOptions[value].landfillFactor * 100
    );
  };

  return (
    <div className="page carbon-methane-page">
      {/* HEADER */}
      <div className="page-header carbon-header">
        <div>
          <div className="eyebrow">
            ENVIRONMENTAL INTELLIGENCE / CLIMATE IMPACT
          </div>

          <h1>Carbon Footprint & Methane</h1>

          <p>
            Estimate lifecycle greenhouse-gas impact and
            explore how waste-management pathways can
            influence methane emissions.
          </p>
        </div>

        <div className="carbon-model-badge">
          <span />
          MODELLED ESTIMATE
        </div>
      </div>

      {/* KPI CARDS */}
      <section className="carbon-kpi-grid">
        <div className="carbon-kpi-card">
          <span>TOTAL CLIMATE IMPACT</span>

          <strong>
            {calculations.totalClimateImpact.toFixed(2)}
          </strong>

          <small>t CO₂e</small>

          <p>Lifecycle + methane impact</p>
        </div>

        <div className="carbon-kpi-card">
          <span>CARBON FOOTPRINT</span>

          <strong>
            {calculations.carbonFootprint.toFixed(2)}
          </strong>

          <small>t CO₂e</small>

          <p>Material and lifecycle emissions</p>
        </div>

        <div className="carbon-kpi-card methane-card">
          <span>METHANE GENERATED</span>

          <strong>
            {calculations.methaneGenerated.toFixed(1)}
          </strong>

          <small>kg CH₄</small>

          <p>Estimated landfill methane</p>
        </div>

        <div className="carbon-kpi-card">
          <span>METHANE CLIMATE IMPACT</span>

          <strong>
            {calculations.methaneCO2e.toFixed(2)}
          </strong>

          <small>t CO₂e</small>

          <p>CO₂-equivalent of estimated CH₄</p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="panel carbon-control-panel">
        <div className="carbon-section-heading">
          <div>
            <div className="eyebrow">
              IMPACT MODEL INPUTS
            </div>

            <h2>Configure waste scenario</h2>
          </div>

          <div className="carbon-status">
            <span />
            CALCULATION READY
          </div>
        </div>

        <div className="carbon-control-grid">
          <div className="carbon-control-block">
            <label>Waste Category</label>

            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value)
              }
            >
              {Object.keys(wasteOptions).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <small>
              Different materials have different
              lifecycle and methane characteristics.
            </small>
          </div>

          <div className="carbon-control-block">
            <div className="carbon-label-row">
              <label>Waste Quantity</label>

              <strong>{quantity} kg</strong>
            </div>

            <input
              type="range"
              min="100"
              max="2000"
              step="20"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
            />

            <div className="range-labels">
              <span>100 kg</span>
              <span>2,000 kg</span>
            </div>
          </div>

          <div className="carbon-control-block">
            <div className="carbon-label-row">
              <label>Landfill Pathway</label>

              <strong>{landfillRate}%</strong>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={landfillRate}
              onChange={(e) =>
                setLandfillRate(Number(e.target.value))
              }
            />

            <div className="range-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* CARBON + METHANE */}
      <div className="carbon-main-grid">
        <section className="panel carbon-chart-panel">
          <div className="carbon-section-heading">
            <div>
              <div className="eyebrow">
                LIFECYCLE EMISSIONS
              </div>

              <h2>Where emissions occur</h2>
            </div>

            <div className="carbon-unit">
              t CO₂e
            </div>
          </div>

          <div className="carbon-chart">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    `${value.toFixed(1)}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} t CO₂e`,
                    "Impact",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="emissions"
                  stroke="#344b3b"
                  fill="#dfe9e0"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="carbon-chart-note">
            <strong>Interpretation</strong>

            <p>
              End-of-life impact includes the modelled
              methane contribution associated with the
              selected landfill pathway.
            </p>
          </div>
        </section>

        <section className="panel methane-panel">
          <div className="carbon-section-heading">
            <div>
              <div className="eyebrow">
                METHANE PATHWAY
              </div>

              <h2>Landfill methane</h2>
            </div>

            <div className="methane-symbol">
              CH₄
            </div>
          </div>

          <div className="methane-visual">
            <div className="methane-ring">
              <div>
                <strong>
                  {calculations.methaneGenerated.toFixed(1)}
                </strong>

                <span>kg CH₄</span>
              </div>
            </div>
          </div>

          <div className="methane-stats">
            <div>
              <span>LANDFILL WASTE</span>

              <strong>
                {calculations.landfillWaste.toFixed(0)} kg
              </strong>
            </div>

            <div>
              <span>CO₂e EQUIVALENT</span>

              <strong>
                {calculations.methaneCO2e.toFixed(2)} t
              </strong>
            </div>
          </div>

          <div className="methane-explanation">
            <strong>Why methane matters</strong>

            <p>
              Organic material placed in oxygen-limited
              landfill conditions can generate methane.
              The estimate shown here is modelled from
              the selected waste category and landfill
              pathway.
            </p>
          </div>
        </section>
      </div>

      {/* WHAT IF */}
      <section className="panel climate-scenario-panel">
        <div className="carbon-section-heading">
          <div>
            <div className="eyebrow">
              WHAT-IF CLIMATE LAB
            </div>

            <h2>
              What if landfill methane was reduced?
            </h2>

            <p>
              Adjust the scenario to explore a modelled
              alternative pathway.
            </p>
          </div>

          <div className="scenario-impact-badge">
            {reduction}% reduction
          </div>
        </div>

        <div className="scenario-slider-area">
          <div className="scenario-value">
            <strong>{reduction}%</strong>

            <span>
              modelled methane reduction
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={reduction}
            onChange={(e) =>
              setReduction(Number(e.target.value))
            }
          />

          <div className="range-labels">
            <span>0%</span>
            <span>90%</span>
          </div>
        </div>

        <div className="scenario-comparison">
          <div className="scenario-box">
            <span>CURRENT PATHWAY</span>

            <strong>
              {calculations.totalClimateImpact.toFixed(2)}
              <small> t CO₂e</small>
            </strong>

            <p>
              Estimated lifecycle + methane impact
            </p>
          </div>

          <div className="scenario-arrow">
            →
          </div>

          <div className="scenario-box scenario-box-highlight">
            <span>ALTERNATIVE SCENARIO</span>

            <strong>
              {calculations.scenarioImpact.toFixed(2)}
              <small> t CO₂e</small>
            </strong>

            <p>
              With {reduction}% methane reduction
            </p>
          </div>

          <div className="scenario-saving">
            <span>MODELLED AVOIDED IMPACT</span>

            <strong>
              {calculations.avoidedImpact.toFixed(2)}
            </strong>

            <small>t CO₂e</small>
          </div>
        </div>
      </section>

      {/* BREAKDOWN */}
      <section className="carbon-breakdown-section">
        <div>
          <div className="eyebrow">
            ENVIRONMENTAL INDICATORS
          </div>

          <h2>Impact breakdown</h2>
        </div>

        <div className="carbon-breakdown-grid">
          <div className="breakdown-card">
            <span className="breakdown-number">
              01
            </span>

            <strong>Material emissions</strong>

            <p>
              Estimated emissions associated with the
              selected material lifecycle.
            </p>

            <b>
              {calculations.carbonFootprint.toFixed(2)}
              {" "}t CO₂e
            </b>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-number">
              02
            </span>

            <strong>Landfill pathway</strong>

            <p>
              Portion of the selected waste assumed to
              follow the landfill pathway.
            </p>

            <b>
              {calculations.landfillWaste.toFixed(0)}
              {" "}kg
            </b>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-number">
              03
            </span>

            <strong>Methane generation</strong>

            <p>
              Modelled methane generation associated
              with the landfill pathway.
            </p>

            <b>
              {calculations.methaneGenerated.toFixed(1)}
              {" "}kg CH₄
            </b>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-number">
              04
            </span>

            <strong>Climate equivalent</strong>

            <p>
              Methane expressed as a carbon-dioxide
              equivalent for comparison.
            </p>

            <b>
              {calculations.methaneCO2e.toFixed(2)}
              {" "}t CO₂e
            </b>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="carbon-methodology">
        <div>
          <div className="eyebrow">
            CALCULATION METHODOLOGY
          </div>

          <h3>How this demo estimates impact</h3>
        </div>

        <div className="methodology-grid">
          <div>
            <span>01</span>

            <strong>Waste quantity</strong>

            <p>
              User-selected waste quantity is used as
              the primary input.
            </p>
          </div>

          <div>
            <span>02</span>

            <strong>Emission factors</strong>

            <p>
              Category-specific illustrative factors
              estimate lifecycle emissions.
            </p>
          </div>

          <div>
            <span>03</span>

            <strong>Methane pathway</strong>

            <p>
              Landfill share is combined with an
              illustrative methane generation factor.
            </p>
          </div>

          <div>
            <span>04</span>

            <strong>CO₂e conversion</strong>

            <p>
              Methane is converted into a comparable
              CO₂-equivalent impact.
            </p>
          </div>
        </div>
      </section>

      <div className="carbon-disclaimer">
        <strong>Modelled estimate — not a verified carbon inventory.</strong>

        <p>
          Values in this frontend demonstration are
          illustrative. A production ECOVERSE implementation
          should use verified emission factors, product-level
          lifecycle data, geographic information, waste
          treatment data and documented methodology.
        </p>
      </div>
    </div>
  );
}

export default CarbonMethanePage;