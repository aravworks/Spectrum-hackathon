import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const products = [
  {
    id: "eco-tee-001",
    name: "Organic Cotton T-Shirt",
    category: "Textile / Fashion",
    material: "Cotton",
    location: "Tiruppur, India",
  },
  {
    id: "eco-phone-001",
    name: "Smartphone X1",
    category: "Electronics / E-waste",
    material: "Aluminium / Lithium-ion",
    location: "Shenzhen, China",
  },
  {
    id: "eco-bottle-001",
    name: "PET Beverage Bottle",
    category: "Plastic / Packaging",
    material: "PET Plastic",
    location: "Pune, India",
  },
];

function ConsumerPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = products.filter((product) =>
    `${product.name} ${product.category} ${product.material}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page consumer-page">

      <div className="consumer-hero">

        <div className="eyebrow">
          CONSUMER INTELLIGENCE
        </div>

        <h1>
          Where did
          <br />
          <span>your product go?</span>
        </h1>

        <p>
          Search a product and explore its materials,
          manufacturing, environmental impact and
          end-of-life pathway.
        </p>

        <div className="product-search">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, material or category..."
          />

          <button>
            Search
          </button>

        </div>

      </div>

      <div className="consumer-results">

        <div className="results-heading">
          <div>
            <h2>Products</h2>
            <p>
              Select a product to open its Digital Product Passport.
            </p>
          </div>

          <span>
            {filtered.length} results
          </span>
        </div>

        <div className="consumer-grid">

          {filtered.map((product) => (
            <div className="consumer-card" key={product.id}>

              <div className="consumer-card-top">

                <span className="category-tag">
                  {product.category}
                </span>

                <span className="verified-small">
                  TRACEABLE
                </span>

              </div>

              <h3>{product.name}</h3>

              <div className="consumer-details">

                <div>
                  <span>Material</span>
                  <strong>{product.material}</strong>
                </div>

                <div>
                  <span>Manufacturing</span>
                  <strong>{product.location}</strong>
                </div>

              </div>

              <Link
                to={`/product/${product.id}`}
                className="dark-button full"
              >
                View Product Passport →
              </Link>

            </div>
          ))}

        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <h3>No matching product</h3>
            <p>
              Try searching for textile, plastic,
              electronics or a product name.
            </p>
          </div>
        )}

      </div>

      <section className="consumer-message">

        <div className="eyebrow">
          WHY THIS MATTERS
        </div>

        <h2>
          The barcode tells you what a product is.
          <br />
          ECOVERSE asks what happened to it.
        </h2>

        <p>
          Product information should not stop at the point
          of purchase. ECOVERSE connects the product journey
          to environmental and waste information.
        </p>

      </section>

    </div>
  );
}

export default ConsumerPage;