import { useMemo, useState } from "react";
import "../styles/marketplace/marketplace.css";

function WasteMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [listingMode, setListingMode] = useState("ALL");
  const [selectedListing, setSelectedListing] = useState(null);

  const listings = [
    {
      id: "MAT-2026-001",
      title: "Clean Cotton Textile Waste",
      category: "TEXTILE",
      material: "Cotton",
      quantity: "85 kg",
      condition: "Clean / Sorted",
      price: "₹18/kg",
      mode: "SALE",
      location: "Kanpur, Uttar Pradesh",
      seller: "Aarav Textiles",
      sellerType: "Business",
      verified: true,
      pickup: true,
      description:
        "Sorted cotton cutting waste suitable for textile recovery, reuse or recycling.",
      listed: "2 hours ago",
    },

    {
      id: "MAT-2026-002",
      title: "PET Plastic Bottles",
      category: "PLASTIC",
      material: "PET",
      quantity: "120 kg",
      condition: "Compressed",
      price: "₹32/kg",
      mode: "SALE",
      location: "Lucknow, Uttar Pradesh",
      seller: "GreenCycle Collection",
      sellerType: "Recycler",
      verified: true,
      pickup: true,
      description:
        "Sorted and compressed PET bottles collected from commercial sources.",
      listed: "5 hours ago",
    },

    {
      id: "MAT-2026-003",
      title: "Old Desktop Computers",
      category: "E-WASTE",
      material: "Electronics",
      quantity: "14 units",
      condition: "Used / Working",
      price: "₹1,500/unit",
      mode: "SALE",
      location: "Noida, Uttar Pradesh",
      seller: "Tech Renewal Hub",
      sellerType: "Business",
      verified: true,
      pickup: false,
      description:
        "Used desktop computers available for reuse, refurbishment or responsible recovery.",
      listed: "Today",
    },

    {
      id: "MAT-2026-004",
      title: "Corrugated Cardboard",
      category: "PAPER",
      material: "Cardboard",
      quantity: "210 kg",
      condition: "Dry / Flattened",
      price: "FREE",
      mode: "FREE",
      location: "Kanpur, Uttar Pradesh",
      seller: "Local Warehouse",
      sellerType: "Business",
      verified: false,
      pickup: true,
      description:
        "Clean flattened cardboard from packaging operations. Available for collection.",
      listed: "Today",
    },

    {
      id: "MAT-2026-005",
      title: "Aluminium Scrap",
      category: "METAL",
      material: "Aluminium",
      quantity: "65 kg",
      condition: "Sorted",
      price: "₹145/kg",
      mode: "SALE",
      location: "Delhi, India",
      seller: "Metro Scrap Works",
      sellerType: "Recycler",
      verified: true,
      pickup: false,
      description:
        "Sorted aluminium scrap suitable for material recovery.",
      listed: "Yesterday",
    },

    {
      id: "MAT-2026-006",
      title: "Used Wooden Furniture",
      category: "FURNITURE",
      material: "Wood",
      quantity: "6 units",
      condition: "Repairable",
      price: "₹500/unit",
      mode: "SALE",
      location: "Kanpur, Uttar Pradesh",
      seller: "Community Listing",
      sellerType: "Individual",
      verified: false,
      pickup: true,
      description:
        "Used tables and storage units. Suitable for repair, reuse or refurbishment.",
      listed: "Yesterday",
    },

    {
      id: "MAT-2026-007",
      title: "Mixed Textile Offcuts",
      category: "TEXTILE",
      material: "Cotton / Polyester",
      quantity: "150 kg",
      condition: "Mixed / Sorted",
      price: "₹10/kg",
      mode: "SALE",
      location: "Jaipur, Rajasthan",
      seller: "Fabric Recovery Unit",
      sellerType: "Business",
      verified: true,
      pickup: true,
      description:
        "Post-production textile offcuts separated by available material streams.",
      listed: "2 days ago",
    },

    {
      id: "MAT-2026-008",
      title: "Glass Bottles",
      category: "GLASS",
      material: "Glass",
      quantity: "300 kg",
      condition: "Clean / Sorted",
      price: "₹7/kg",
      mode: "SALE",
      location: "Agra, Uttar Pradesh",
      seller: "Bottle Recovery Centre",
      sellerType: "Recycler",
      verified: true,
      pickup: true,
      description:
        "Sorted reusable and recyclable glass bottles.",
      listed: "2 days ago",
    },
  ];

  const categories = [
    "ALL",
    "TEXTILE",
    "PLASTIC",
    "E-WASTE",
    "PAPER",
    "METAL",
    "FURNITURE",
    "GLASS",
  ];

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        listing.category === activeCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        listing.title.toLowerCase().includes(searchText) ||
        listing.material.toLowerCase().includes(searchText) ||
        listing.category.toLowerCase().includes(searchText);

      const locationText = location.toLowerCase().trim();

      const matchesLocation =
        !locationText ||
        listing.location.toLowerCase().includes(locationText);

      const matchesMode =
        listingMode === "ALL" ||
        listing.mode === listingMode;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesLocation &&
        matchesMode
      );
    });
  }, [
    activeCategory,
    search,
    location,
    listingMode,
  ]);

  const openListing = (listing) => {
    setSelectedListing(listing);
  };

  const closeListing = () => {
    setSelectedListing(null);
  };

  return (
    <div className="page marketplace-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="marketplace-hero">

        <div className="marketplace-hero-content">

          <div className="eyebrow">
            ECOVERSE MATERIAL EXCHANGE
          </div>

          <h1>
            Give waste
            <br />
            another lifecycle.
          </h1>

          <p>
            Buy, sell, exchange or give away recoverable
            materials. Connect unused materials with
            people, businesses and recovery operators
            who can put them to productive use.
          </p>

          <div className="marketplace-hero-actions">

            <button
              type="button"
              className="dark-button"
              onClick={() => {
                document
                  .getElementById("marketplace-listings")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Browse Materials →
            </button>

            <button
              type="button"
              className="light-button"
              onClick={() =>
                alert(
                  "Create Listing will be connected to the backend."
                )
              }
            >
              + List Material
            </button>

          </div>

        </div>

        <div className="marketplace-hero-stats">

          <div>
            <span>ACTIVE LISTINGS</span>
            <strong>248</strong>
          </div>

          <div>
            <span>MATERIALS RECOVERED</span>
            <strong>18.4 T</strong>
          </div>

          <div>
            <span>ACTIVE BUYERS</span>
            <strong>126</strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="marketplace-search-panel">

        <div className="marketplace-search-main">

          <div className="marketplace-search-input">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search material, product or waste type..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="marketplace-location-input">

            <span>⌖</span>

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />

          </div>

          <select
            value={listingMode}
            onChange={(e) =>
              setListingMode(e.target.value)
            }
            className="marketplace-mode-select"
          >
            <option value="ALL">
              All Listings
            </option>

            <option value="SALE">
              For Sale
            </option>

            <option value="FREE">
              Free
            </option>
          </select>

        </div>

      </section>

      {/* =====================================================
          CATEGORY NAVIGATION
      ===================================================== */}

      <section className="marketplace-category-bar">

        <div className="eyebrow">
          MATERIAL CATEGORIES
        </div>

        <div className="marketplace-category-list">

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={
                activeCategory === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}
            </button>
          ))}

        </div>

      </section>

      {/* =====================================================
          MARKETPLACE CONTENT
      ===================================================== */}

      <section
        id="marketplace-listings"
        className="marketplace-content"
      >

        <div className="marketplace-content-header">

          <div>
            <div className="eyebrow">
              AVAILABLE MATERIALS
            </div>

            <h2>
              {filteredListings.length} listings
            </h2>
          </div>

          <div className="marketplace-sort">

            <span>Sort by</span>

            <select defaultValue="recent">
              <option value="recent">
                Recently listed
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>

          </div>

        </div>

        {filteredListings.length > 0 ? (

          <div className="marketplace-grid">

            {filteredListings.map((listing) => (

              <article
                className="marketplace-card"
                key={listing.id}
                onClick={() =>
                  openListing(listing)
                }
              >

                {/* IMAGE PLACEHOLDER */}

                <div className="marketplace-card-image">

                  <div className="marketplace-material-symbol">
                    {listing.category === "TEXTILE" && "◫"}
                    {listing.category === "PLASTIC" && "◇"}
                    {listing.category === "E-WASTE" && "▣"}
                    {listing.category === "PAPER" && "▤"}
                    {listing.category === "METAL" && "◆"}
                    {listing.category === "FURNITURE" && "⌂"}
                    {listing.category === "GLASS" && "○"}
                  </div>

                  <span className="marketplace-category-label">
                    {listing.category}
                  </span>

                  {listing.verified && (
                    <span className="marketplace-verified">
                      ✓ VERIFIED
                    </span>
                  )}

                </div>

                {/* CARD CONTENT */}

                <div className="marketplace-card-body">

                  <div className="marketplace-card-top">

                    <span>
                      {listing.listed}
                    </span>

                    <button
                      type="button"
                      className="marketplace-save"
                      onClick={(e) => {
                        e.stopPropagation();

                        alert(
                          "Listing saved to your watchlist."
                        );
                      }}
                    >
                      ♡
                    </button>

                  </div>

                  <h3>
                    {listing.title}
                  </h3>

                  <div className="marketplace-price">
                    {listing.price}
                  </div>

                  <div className="marketplace-card-details">

                    <span>
                      {listing.quantity}
                    </span>

                    <span>
                      {listing.condition}
                    </span>

                  </div>

                  <div className="marketplace-card-location">
                    ⌖ {listing.location}
                  </div>

                  <div className="marketplace-card-seller">

                    <div className="seller-avatar">
                      {listing.seller.charAt(0)}
                    </div>

                    <div>
                      <strong>
                        {listing.seller}
                      </strong>

                      <small>
                        {listing.sellerType}
                      </small>
                    </div>

                  </div>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="marketplace-empty">

            <div className="marketplace-empty-icon">
              ⌕
            </div>

            <h2>
              No materials found
            </h2>

            <p>
              Try another material, category or location.
            </p>

            <button
              type="button"
              className="light-button"
              onClick={() => {
                setSearch("");
                setLocation("");
                setActiveCategory("ALL");
                setListingMode("ALL");
              }}
            >
              Clear Filters
            </button>

          </div>

        )}

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="panel marketplace-flow">

        <div className="section-heading">

          <div>
            <div className="eyebrow">
              MATERIAL RECOVERY FLOW
            </div>

            <h2>
              From listing to recovery.
            </h2>
          </div>

          <span className="section-meta">
            ECOVERSE EXCHANGE
          </span>

        </div>

        <div className="marketplace-flow-grid">

          <div>
            <span>01</span>
            <strong>LIST</strong>
            <p>
              A person or business lists unused
              or recoverable material.
            </p>
          </div>

          <div className="marketplace-flow-arrow">
            →
          </div>

          <div>
            <span>02</span>
            <strong>CONNECT</strong>
            <p>
              A buyer, recycler or recovery operator
              expresses interest.
            </p>
          </div>

          <div className="marketplace-flow-arrow">
            →
          </div>

          <div>
            <span>03</span>
            <strong>TRANSFER</strong>
            <p>
              Material is collected or transferred
              between participants.
            </p>
          </div>

          <div className="marketplace-flow-arrow">
            →
          </div>

          <div>
            <span>04</span>
            <strong>RECOVER</strong>
            <p>
              The material enters reuse, repair,
              recycling or another appropriate pathway.
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          TRACEABILITY
      ===================================================== */}

      <section className="marketplace-trace-section">

        <div className="marketplace-trace-copy">

          <div className="eyebrow">
            BEYOND CLASSIFIEDS
          </div>

          <h2>
            A material exchange
            <br />
            with traceability.
          </h2>

          <p>
            ECOVERSE can connect a completed material
            exchange with its downstream journey.
            Instead of ending at a transaction, the
            material can continue through pickup,
            transport, recovery and final outcome records.
          </p>

        </div>

        <div className="marketplace-trace-cards">

          <div>
            <span>LISTING</span>
            <strong>MAT-2026-001</strong>
            <small>
              85 kg cotton textile waste
            </small>
          </div>

          <div className="trace-arrow">
            →
          </div>

          <div>
            <span>PICKUP</span>
            <strong>PR-2026-1842</strong>
            <small>
              Collection requested
            </small>
          </div>

          <div className="trace-arrow">
            →
          </div>

          <div>
            <span>MANIFEST</span>
            <strong>WM-2026-00204</strong>
            <small>
              Material movement recorded
            </small>
          </div>

        </div>

      </section>

      {/* =====================================================
          LISTING MODAL
      ===================================================== */}

      {selectedListing && (

        <div
          className="marketplace-modal-overlay"
          onClick={closeListing}
        >

          <div
            className="marketplace-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="marketplace-modal-close"
              onClick={closeListing}
            >
              ×
            </button>

            <div className="eyebrow">
              MATERIAL LISTING
            </div>

            <h2>
              {selectedListing.title}
            </h2>

            <div className="marketplace-modal-price">
              {selectedListing.price}
            </div>

            <div className="marketplace-modal-grid">

              <div>
                <span>MATERIAL</span>
                <strong>
                  {selectedListing.material}
                </strong>
              </div>

              <div>
                <span>QUANTITY</span>
                <strong>
                  {selectedListing.quantity}
                </strong>
              </div>

              <div>
                <span>CONDITION</span>
                <strong>
                  {selectedListing.condition}
                </strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>
                  {selectedListing.location}
                </strong>
              </div>

              <div>
                <span>SELLER</span>
                <strong>
                  {selectedListing.seller}
                </strong>
              </div>

              <div>
                <span>PICKUP</span>
                <strong>
                  {selectedListing.pickup
                    ? "Available"
                    : "Not available"}
                </strong>
              </div>

            </div>

            <div className="marketplace-modal-description">

              <div className="eyebrow">
                DESCRIPTION
              </div>

              <p>
                {selectedListing.description}
              </p>

            </div>

            <div className="marketplace-modal-actions">

              <button
                type="button"
                className="dark-button"
                onClick={() =>
                  alert(
                    `Interest recorded for ${selectedListing.id}`
                  )
                }
              >
                I'm Interested →
              </button>

              <button
                type="button"
                className="light-button"
                onClick={() =>
                  alert(
                    "Pickup request will be connected to the ECOVERSE pickup workflow."
                  )
                }
              >
                Request Pickup
              </button>

            </div>

            <div className="marketplace-modal-note">

              <strong>
                ECOVERSE traceability
              </strong>

              <p>
                After a successful exchange, the material
                can be connected to a pickup request and
                downstream waste manifest.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default WasteMarketplacePage;