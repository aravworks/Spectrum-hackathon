import { Link, useParams } from "react-router-dom";

const stages = [
  {
    number: "01",
    title: "Raw Material",
    status: "VERIFIED",
    description:
      "Primary material information is available for the product.",
    value: "Cotton",
  },
  {
    number: "02",
    title: "Manufacturing",
    status: "COMPANY REPORTED",
    description:
      "Manufacturing location and production information are recorded.",
    value: "Tiruppur, India",
  },
  {
    number: "03",
    title: "Distribution",
    status: "MODELLED",
    description:
      "Distribution pathway has been estimated from available records.",
    value: "Supply Chain",
  },
  {
    number: "04",
    title: "Consumption",
    status: "VERIFIED",
    description:
      "Product entered the consumer-use stage.",
    value: "Consumer",
  },
  {
    number: "05",
    title: "Return / Reuse",
    status: "PARTIAL DATA",
    description:
      "Return or reuse information is incomplete.",
    value: "58% traceable",
  },
  {
    number: "06",
    title: "Recycling",
    status: "MODELLED",
    description:
      "Potential recovery pathway estimated from available information.",
    value: "42% recovery",
  },
  {
    number: "07",
    title: "Final Outcome",
    status: "DATA GAP",
    description:
      "The final destination could not be verified from available records.",
    value: "Unknown",
  },
];

function ProductTracePage() {
  const { id } = useParams();

  return (
    <div className="page">

      <div className="breadcrumb">
        ECOVERSE / PRODUCT / TRACE
      </div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            PRODUCT LIFECYCLE TRACE
          </div>

          <h1>Organic Cotton T-Shirt</h1>

          <p>
            Follow the available evidence across every
            lifecycle stage.
          </p>
        </div>

        <Link
          to={`/product/${id}`}
          className="light-button"
        >
          ← Product Passport
        </Link>

      </div>

      <section className="trace-summary">

        <div>
          <span>TRACEABILITY</span>
          <strong>76.4%</strong>
        </div>

        <div>
          <span>VERIFIED STAGES</span>
          <strong>3 / 7</strong>
        </div>

        <div>
          <span>DATA GAPS</span>
          <strong>2</strong>
        </div>

        <div>
          <span>LAST UPDATED</span>
          <strong>Today</strong>
        </div>

      </section>

      <section className="trace-timeline">

        {stages.map((stage, index) => (
          <div
            className={`trace-stage ${
              stage.status === "DATA GAP"
                ? "gap-stage"
                : ""
            }`}
            key={stage.number}
          >

            <div className="trace-marker">
              {stage.number}
            </div>

            <div className="trace-content">

              <div className="trace-stage-top">

                <div>
                  <span className="trace-stage-label">
                    STAGE {stage.number}
                  </span>

                  <h2>{stage.title}</h2>
                </div>

                <span
                  className={`trace-status ${
                    stage.status === "VERIFIED"
                      ? "verified-status"
                      : stage.status === "DATA GAP"
                      ? "gap-status"
                      : "normal-status"
                  }`}
                >
                  {stage.status}
                </span>

              </div>

              <p>{stage.description}</p>

              <div className="trace-value">
                {stage.value}
              </div>

            </div>

            {index !== stages.length - 1 && (
              <div className="trace-connector" />
            )}

          </div>
        ))}

      </section>

      <section className="panel trace-note">

        <div>
          <div className="eyebrow">
            INTERPRETATION
          </div>

          <h2>
            A traceability gap is not automatically an
            environmental violation.
          </h2>

          <p>
            ECOVERSE distinguishes between missing information,
            modelled estimates, company-reported information
            and externally verified records. Gaps indicate
            where additional evidence is required.
          </p>
        </div>

      </section>

    </div>
  );
}

export default ProductTracePage;