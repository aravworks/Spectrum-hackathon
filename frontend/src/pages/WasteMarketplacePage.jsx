import { useMemo, useState, useEffect } from "react";
import "../styles/marketplace/marketplace.css";

function WasteMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [listingMode, setListingMode] = useState("ALL");
  const [selectedListing, setSelectedListing] = useState(null);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newListing, setNewListing] = useState({ category_id: "1", quantity_kg: "", asking_price: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  
  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("ecoverseToken");
      const res = await fetch("https://spectrum-hackathon.onrender.com/api/v1/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: parseInt(newListing.category_id),
          quantity_kg: parseFloat(newListing.quantity_kg),
          asking_price: parseFloat(newListing.asking_price),
          location: { lat: 26.4499, lng: 80.3319 }
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = "Failed to create listing";
        if (err.detail) {
          if (typeof err.detail === 'string') errMsg = err.detail;
          else if (Array.isArray(err.detail)) errMsg = err.detail.map(e => e.msg).join(', ');
        }
        throw new Error(errMsg);
      }
      
      const created = await res.json();
      setListings([created, ...listings]);
      setShowModal(false);
      setNewListing({ category_id: "1", quantity_kg: "", asking_price: "", location: "" });
      alert("Listing created successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // fetchListings is handled in useEffect

  useEffect(() => {
    async function fetchListings() {
      try {
        const token = localStorage.getItem("ecoverseToken");
        const res = await fetch("https://spectrum-hackathon.onrender.com/api/v1/marketplace/listings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch listings");
        let data = await res.json();
        
        if (!data || data.length === 0) {
          data = [
            { id: "MKT-1001", title: "Sorted PET Plastic Bottles", category_id: 2, quantity_kg: 500, asking_price: 15, location: { address: "Civil Lines, Kanpur" }, seller_id: "City Recyclers Ltd", description: "Clean, sorted PET bottles." },
            { id: "MKT-1002", title: "Old Laptops & Motherboards", category_id: 3, quantity_kg: 50, asking_price: 200, location: { address: "Swaroop Nagar, Kanpur" }, seller_id: "Tech Recovery Services", description: "Mixed electronics." },
            { id: "MKT-1003", title: "Textile Scrap from Factory", category_id: 1, quantity_kg: 120, asking_price: 5, location: { address: "Fazalganj Industrial Area" }, seller_id: "Kanpur Garments", description: "Cotton and polyester mixed scraps." }
          ];
        }

        const categoryMap = { 1: "TEXTILE", 2: "PLASTIC", 3: "E-WASTE", 4: "ORGANIC", 5: "HAZARDOUS" };

        const formattedListings = data.map(item => ({
          id: item.id,
          title: item.title || `${categoryMap[item.category_id] || "Mixed"} Waste`,
          category: item.category || categoryMap[item.category_id] || "ALL",
          material: item.category || categoryMap[item.category_id] || "Mixed Material",
          quantity: `${item.quantity_kg} kg`,
          condition: "Sorted",
          price: `₹${item.asking_price}/kg`,
          mode: "SALE",
          location: item.location ? (item.location.address || "Kanpur") : "Unknown Location",
          seller: item.seller_id,
          sellerType: "User",
          verified: true,
          pickup: true,
          description: item.description || "No description provided."
        }));
        
        setListings(formattedListings);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchListings();
  }, []);


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
              onClick={() => setShowModal(true)}
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

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Create New Listing</h2>
            <form onSubmit={handleCreateListing} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: "600" }}>
                Material Category
                <select 
                  value={newListing.category_id} 
                  onChange={e => setNewListing({...newListing, category_id: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                  <option value="1">Textile / Fashion</option>
                  <option value="2">Plastic / Packaging</option>
                  <option value="3">Electronics / E-waste</option>
                  <option value="4">Organic / Food</option>
                  <option value="5">Hazardous / Batteries</option>
                </select>
              </label>
              
              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: "600" }}>
                Quantity (kg)
                <input 
                  type="number" min="0.1" step="0.1" required
                  value={newListing.quantity_kg}
                  onChange={e => setNewListing({...newListing, quantity_kg: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: "600" }}>
                Asking Price (₹)
                <input 
                  type="number" min="0" step="1" required
                  value={newListing.asking_price}
                  onChange={e => setNewListing({...newListing, asking_price: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: "600" }}>
                Location Area
                <input 
                  type="text" required
                  placeholder="e.g. Civil Lines, Kanpur"
                  value={newListing.location}
                  onChange={e => setNewListing({...newListing, location: e.target.value})}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 15px", border: "none", background: "#f0f0f0", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "10px 15px", border: "none", background: "#064b3a", color: "white", borderRadius: "6px", cursor: "pointer" }}>
                  {submitting ? "Posting..." : "Post Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteMarketplacePage;