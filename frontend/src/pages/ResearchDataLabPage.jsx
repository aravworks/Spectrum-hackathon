import { useMemo, useState } from "react";

const datasets = [
  {
    id: "DS-001",
    name: "Municipal Waste Generation",
    category: "Waste",
    location: "Kanpur",
    year: "2026",
    value: "1,240",
    unit: "tonnes/day",
    confidence: "MODELLED",
    source: "ECOVERSE Research Model",
  },
  {
    id: "DS-002",
    name: "Textile Material Recovery",
    category: "Textile",
    location: "India",
    year: "2025",
    value: "38.4",
    unit: "%",
    confidence: "EXTERNAL",
    source: "Environmental Dataset",
  },
  {
    id: "DS-003",
    name: "Plastic Waste Recovery",
    category: "Plastic",
    location: "India",
    year: "2025",
    value: "42.7",
    unit: "%",
    confidence: "EXTERNAL",
    source: "Environmental Dataset",
  },
  {
    id: "DS-004",
    name: "E-Waste Generation",
    category: "E-waste",
    location: "Uttar Pradesh",
    year: "2026",
    value: "182",
    unit: "kt/year",
    confidence: "COMPANY REPORTED",
    source: "Industry Data",
  },
  {
    id: "DS-005",
    name: "Landfill Diversion",
    category: "Municipal",
    location: "Kanpur",
    year: "2026",
    value: "31.6",
    unit: "%",
    confidence: "MODELLED",
    source: "ECOVERSE Research Model",
  },
  {
    id: "DS-006",
    name: "Water Consumption",
    category: "Textile",
    location: "Global",
    year: "2025",
    value: "2,700",
    unit: "L/kg",
    confidence: "EXTERNAL",
    source: "Environmental Dataset",
  },
];

const researchTopics = [
  {
    number: "01",
    title: "Waste Generation",
    description:
      "Study how waste volumes vary across categories, regions and time periods.",
  },
  {
    number: "02",
    title: "Material Recovery",
    description:
      "Explore recovery, recycling and reuse patterns across material streams.",
  },
  {
    number: "03",
    title: "Resource Consumption",
    description:
      "Examine water, energy and raw-material requirements throughout product lifecycles.",
  },
  {
    number: "04",
    title: "Environmental Impact",
    description:
      "Analyse modelled carbon, methane, landfill and resource-impact indicators.",
  },
];

function ResearchDataLabPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [year, setYear] = useState("All");
  const [selectedDataset, setSelectedDataset] = useState(null);

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesSearch =
        dataset.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        dataset.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        dataset.category === category;

      const matchesLocation =
        location === "All" ||
        dataset.location === location;

      const matchesYear =
        year === "All" ||
        dataset.year === year;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesYear
      );
    });
  }, [search, category, location, year]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setYear("All");
  };

  return (
    <div className="page research-data-lab-page">

      {/* HEADER */}

      <div className="page-header research-lab-header">
        <div>
          <div className="eyebrow">
            ECOVERSE RESEARCH / DATA INTELLIGENCE
          </div>

          <h1>Research Data Lab</h1>

          <p>
            Explore environmental datasets, investigate
            lifecycle patterns and examine the evidence
            behind ECOVERSE intelligence.
          </p>
        </div>

        <div className="research-status">
          <span />
          RESEARCH WORKSPACE
        </div>
      </div>

      {/* RESEARCH OVERVIEW */}

      <section className="research-lab-intro">

        <div>
          <div className="eyebrow">
            DATA EXPLORATION
          </div>

          <h2>
            Investigate the environmental
            data behind the system.
          </h2>

          <p>
            Research Data Lab brings together waste,
            resource, material and environmental indicators
            into one structured workspace.
          </p>
        </div>

        <div className="research-intro-metrics">

          <div>
            <strong>{datasets.length}</strong>
            <span>Datasets</span>
          </div>

          <div>
            <strong>6</strong>
            <span>Categories</span>
          </div>

          <div>
            <strong>4</strong>
            <span>Research Topics</span>
          </div>

          <div>
            <strong>4</strong>
            <span>Confidence Levels</span>
          </div>

        </div>

      </section>

      {/* DATASET EXPLORER */}

      <section className="panel research-explorer">

        <div className="research-section-heading">

          <div>
            <div className="eyebrow">
              DATASET EXPLORER
            </div>

            <h2>
              Environmental datasets
            </h2>

            <p>
              Search and filter datasets before
              examining individual records.
            </p>
          </div>

          <div className="dataset-count">
            {filteredDatasets.length} results
          </div>

        </div>

        {/* FILTERS */}

        <div className="research-filters">

          <div className="research-search">
            <label>SEARCH DATA</label>

            <input
              type="text"
              placeholder="Search dataset or ID..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div>
            <label>CATEGORY</label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="All">All categories</option>
              <option value="Waste">Waste</option>
              <option value="Textile">Textile</option>
              <option value="Plastic">Plastic</option>
              <option value="E-waste">E-waste</option>
              <option value="Municipal">Municipal</option>
            </select>
          </div>

          <div>
            <label>LOCATION</label>

            <select
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            >
              <option value="All">All locations</option>
              <option value="Kanpur">Kanpur</option>
              <option value="India">India</option>
              <option value="Uttar Pradesh">
                Uttar Pradesh
              </option>
              <option value="Global">Global</option>
            </select>
          </div>

          <div>
            <label>YEAR</label>

            <select
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
            >
              <option value="All">All years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <button
            type="button"
            className="research-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>

        {/* TABLE */}

        <div className="research-table-wrapper">

          <table className="research-table">

            <thead>
              <tr>
                <th>DATASET</th>
                <th>CATEGORY</th>
                <th>LOCATION</th>
                <th>YEAR</th>
                <th>VALUE</th>
                <th>CONFIDENCE</th>
                <th>SOURCE</th>
                <th />
              </tr>
            </thead>

            <tbody>

              {filteredDatasets.map((dataset) => (

                <tr key={dataset.id}>

                  <td>
                    <div className="dataset-name">
                      <strong>{dataset.name}</strong>
                      <span>{dataset.id}</span>
                    </div>
                  </td>

                  <td>{dataset.category}</td>

                  <td>{dataset.location}</td>

                  <td>{dataset.year}</td>

                  <td>
                    <strong>
                      {dataset.value}
                    </strong>{" "}
                    {dataset.unit}
                  </td>

                  <td>
                    <span
                      className={`confidence-badge ${dataset.confidence
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >
                      {dataset.confidence}
                    </span>
                  </td>

                  <td>{dataset.source}</td>

                  <td>
                    <button
                      type="button"
                      className="dataset-view-button"
                      onClick={() =>
                        setSelectedDataset(dataset)
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredDatasets.length === 0 && (
            <div className="research-empty">
              <strong>No datasets found</strong>
              <p>
                Try changing the search or filters.
              </p>
            </div>
          )}

        </div>

      </section>

      {/* CONFIDENCE SYSTEM */}

      <section className="research-confidence-section">

        <div>
          <div className="eyebrow">
            DATA CONFIDENCE
          </div>

          <h2>
            Understand where the data comes from.
          </h2>

          <p>
            ECOVERSE distinguishes measured, reported and
            modelled information instead of presenting every
            number as equally certain.
          </p>
        </div>

        <div className="confidence-grid">

          <div className="confidence-card verified">
            <span className="confidence-marker" />
            <strong>VERIFIED / EXTERNAL</strong>
            <p>
              Data supported by external or documented
              sources.
            </p>
          </div>

          <div className="confidence-card reported">
            <span className="confidence-marker" />
            <strong>COMPANY REPORTED</strong>
            <p>
              Information supplied or reported by an
              organisation.
            </p>
          </div>

          <div className="confidence-card modelled">
            <span className="confidence-marker" />
            <strong>MODELLED</strong>
            <p>
              Estimates generated using documented
              assumptions or models.
            </p>
          </div>

          <div className="confidence-card unavailable">
            <span className="confidence-marker" />
            <strong>UNAVAILABLE</strong>
            <p>
              Information that is currently missing or
              cannot be verified.
            </p>
          </div>

        </div>

      </section>

      {/* RESEARCH TOPICS */}

      <section className="panel research-topics">

        <div className="research-section-heading">

          <div>
            <div className="eyebrow">
              RESEARCH TOPICS
            </div>

            <h2>
              Questions the lab can investigate
            </h2>
          </div>

        </div>

        <div className="research-topic-grid">

          {researchTopics.map((topic) => (

            <div
              className="research-topic-card"
              key={topic.number}
            >

              <span>{topic.number}</span>

              <h3>{topic.title}</h3>

              <p>
                {topic.description}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch(topic.title);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Explore data →
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* RESEARCH METHODOLOGY */}

      <section className="research-methodology">

        <div>
          <div className="eyebrow">
            RESEARCH RECORD
          </div>

          <h2>
            Every dataset needs context.
          </h2>

          <p>
            Before using a dataset for research,
            ECOVERSE records its source, period,
            methodology, unit and confidence level.
          </p>
        </div>

        <div className="methodology-grid">

          <div>
            <span>01</span>
            <strong>Source</strong>
            <p>
              Where the information originated.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Period</strong>
            <p>
              Time period represented by the data.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>Methodology</strong>
            <p>
              How the indicator was measured or estimated.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>Limitations</strong>
            <p>
              Uncertainty and known data gaps.
            </p>
          </div>

        </div>

      </section>

      {/* MODAL */}

      {selectedDataset && (

        <div
          className="research-modal-overlay"
          onClick={() => setSelectedDataset(null)}
        >

          <div
            className="research-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="research-modal-close"
              onClick={() =>
                setSelectedDataset(null)
              }
            >
              ×
            </button>

            <div className="eyebrow">
              DATASET RECORD
            </div>

            <h2>
              {selectedDataset.name}
            </h2>

            <span className="dataset-modal-id">
              {selectedDataset.id}
            </span>

            <div className="dataset-detail-grid">

              <div>
                <span>Category</span>
                <strong>
                  {selectedDataset.category}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {selectedDataset.location}
                </strong>
              </div>

              <div>
                <span>Year</span>
                <strong>
                  {selectedDataset.year}
                </strong>
              </div>

              <div>
                <span>Value</span>
                <strong>
                  {selectedDataset.value}{" "}
                  {selectedDataset.unit}
                </strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>
                  {selectedDataset.confidence}
                </strong>
              </div>

              <div>
                <span>Source</span>
                <strong>
                  {selectedDataset.source}
                </strong>
              </div>

            </div>

            <div className="dataset-methodology-note">

              <strong>
                Research note
              </strong>

              <p>
                This record is presented for research
                exploration. Modelled values should not
                be interpreted as direct measurements.
                Production datasets should retain their
                documented methodology and source records.
              </p>

            </div>

          </div>

        </div>

      )}

      {/* DISCLAIMER */}

      <div className="research-disclaimer">

        <div className="disclaimer-icon">
          i
        </div>

        <div>
          <strong>
            Research data demonstration
          </strong>

          <p>
            The datasets currently displayed in this
            frontend are demonstration records. They
            should be replaced with verified datasets
            and documented sources when the ECOVERSE
            backend is connected.
          </p>
        </div>

      </div>

    </div>
  );
}

export default ResearchDataLabPage;