import { Link, useParams } from "react-router-dom";
import "../styles/product-passport/product-passport.css";

const products = {
  "eco-tee-001": {
    name: "Organic Cotton T-Shirt",
    category: "Textile / Fashion",
    brand: "Demo Apparel",
    material: "92% Cotton / 8% Recycled Cotton",
    location: "Tiruppur, India",
    recycled: "8%",
    confidence: "Company Reported",
  },
  "eco-phone-001": {
    name: "Smartphone X1",
    category: "Electronics / E-waste",
    brand: "Demo Electronics",
    material: "Aluminium / Glass / Lithium-ion",
    location: "Shenzhen, China",
    recycled: "18%",
    confidence: "Verified",
  },
  "eco-bottle-001": {
    name: "PET Beverage Bottle",
    category: "Plastic / Packaging",
    brand: "Demo Beverages",
    material: "PET Plastic",
    location: "Pune, India",
    recycled: "42%",
    confidence: "Verified",
  },
};

function ProductPassportPage() {
  const { id } = useParams();

  const product =
    products[id] || products["eco-tee-001"];

  return (
    <div className="page product-passport-page">

      <div className="breadcrumb">
        ECOVERSE / PRODUCTS / {product.category.toUpperCase()}
      </div>

      <div className="passport-header">

        <div>
          <div className="eyebrow">
            DIGITAL PRODUCT PASSPORT
          </div>

          <h1>{product.name}</h1>

          <p>
            A lifecycle record showing what is known about
            this product, its materials and its environmental
            pathway.
          </p>
        </div>

        <span className="passport-status">
          ● ACTIVE RECORD
        </span>

      </div>

      <div className="passport-grid">

        <section className="panel">

          <div className="panel-heading">
            <div>
              <h2>Product Information</h2>
              <p>Core passport information</p>
            </div>
          </div>

          <div className="info-grid">

            <Info label="Product" value={product.name} />
            <Info label="Category" value={product.category} />
            <Info label="Brand" value={product.brand} />
            <Info label="Material" value={product.material} />
            <Info label="Manufacturing" value={product.location} />
            <Info label="Recycled Content" value={product.recycled} />

          </div>

        </section>

        <section className="panel">

          <div className="panel-heading">
            <div>
              <h2>Data Confidence</h2>
              <p>How the information was obtained</p>
            </div>
          </div>

          <div className="confidence-main">
            <div className="confidence-circle">
              76%
            </div>

            <div>
              <strong>{product.confidence}</strong>
              <p>
                Available lifecycle information has been
                classified according to its source and
                verification status.
              </p>
            </div>
          </div>

          <div className="confidence-key">

            <span>
              <i className="dot verified" />
              Verified
            </span>

            <span>
              <i className="dot reported" />
              Company Reported
            </span>

            <span>
              <i className="dot modelled" />
              Modelled
            </span>

            <span>
              <i className="dot unavailable" />
              Unavailable
            </span>

          </div>

        </section>

      </div>

      <section className="panel lifecycle-panel">

        <div className="panel-heading">

          <div>
            <div className="eyebrow">
              LIFECYCLE
            </div>

            <h2>Product Journey</h2>

            <p>
              Follow this product across its lifecycle.
            </p>
          </div>

          <Link
            to={`/product/${id}/trace`}
            className="dark-button"
          >
            Open Full Trace →
          </Link>

        </div>

        <div className="passport-lifecycle">

          {[
            ["01", "Raw Material", "Cotton"],
            ["02", "Manufacturing", product.location],
            ["03", "Distribution", "Supply chain"],
            ["04", "Consumption", "Consumer"],
            ["05", "Return / Reuse", "Partial data"],
            ["06", "Recycling", "Modelled"],
            ["07", "Final Outcome", "Unknown"],
          ].map(([number, stage, value], index) => (
            <div className="passport-stage" key={stage}>

              <div className="passport-stage-number">
                {number}
              </div>

              <strong>{stage}</strong>

              <span>{value}</span>

              {index !== 6 && (
                <div className="stage-line" />
              )}

            </div>
          ))}

        </div>

      </section>

      <section className="passport-grid">

        <section className="panel">

          <div className="panel-heading">
            <div>
              <h2>Environmental Indicators</h2>
              <p>Current product-level estimates</p>
            </div>
          </div>

          <div className="indicator-list">

            <Indicator label="Water Use" value="2,700 L" />
            <Indicator label="Energy" value="41.2 kWh" />
            <Indicator label="GHG Emissions" value="18.2 kg CO₂e" />
            <Indicator label="Production Waste" value="0.84 kg" />

          </div>

        </section>

        <section className="panel">

          <div className="panel-heading">
            <div>
              <h2>Traceability Gap</h2>
              <p>Information currently unavailable</p>
            </div>
          </div>

          <div className="trace-gap-box">

            <strong>Final End-of-Life Outcome</strong>

            <p>
              The available record does not currently verify
              the final destination or treatment pathway.
            </p>

            <small>
              Information unavailable — this is not a
              confirmation of illegal disposal.
            </small>

          </div>

        </section>

      </section>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Indicator({ label, value }) {
  return (
    <div className="indicator-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default ProductPassportPage;