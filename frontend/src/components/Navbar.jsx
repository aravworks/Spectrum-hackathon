import { Link } from "react-router-dom";

const modules = [
  { path: "/dashboard", label: "Overview" },
  { path: "/consumer", label: "Product Trace" },
  { path: "/environmental-impact", label: "Environmental Impact" },
  { path: "/climate-lab", label: "Climate Lab" },
  { path: "/research-data-lab", label: "Research Data Lab" },
  { path: "/carbon-methane", label: "Carbon & Methane" },
  { path: "/satellite-gis", label: "Satellite & GIS" },
  { path: "/treatment-simulation", label: "Treatment Simulation" },
  { path: "/waste-manifest", label: "Waste Manifest" },
  { path: "/waste-reports", label: "Waste Reports" },
  { path: "/report-waste", label: "Report Waste Issue" },
  { path: "/pickup-request", label: "Pickup Request" },
  { path: "/complaint-tracking", label: "Complaint Tracking" },
  { path: "/waste-awareness", label: "Waste Awareness" },
  { path: "/waste-marketplace", label: "EcoExchange" },
  { path: "/route-optimization", label: "Route Optimization" },
  { path: "/rewards", label: "EcoCoins & Rewards" },
  { path: "/ai-chatbot", label: "AI Assistant" },
];

function Navbar() {
  return (
    <header className="navbar">

      <Link to="/" className="brand">
        <div className="brand-mark">E</div>

        <div>
          <div className="brand-name">
            ECOVERSE
          </div>

          <div className="brand-subtitle">
            Environmental Intelligence
          </div>
        </div>
      </Link>

      <nav className="navbar-module-nav">

        {modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="navbar-module-link"
          >
            {module.label}
          </Link>
        ))}

      </nav>

      <div className="navbar-actions">

        <Link
          to="/consumer"
          className="nav-search"
        >
          Search Product
        </Link>

        <Link
          to="/ai-chatbot"
          className="nav-ai-button"
        >
          AI
        </Link>

        <Link
          to="/dashboard"
          className="nav-dashboard"
        >
          Dashboard
        </Link>

      </div>

    </header>
  );
}

export default Navbar;