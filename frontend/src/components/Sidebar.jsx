import { NavLink } from "react-router-dom";

function Sidebar() {
  const links = [
    {
      path: "/dashboard",
      label: "Overview",
    },
    {
      path: "/consumer",
      label: "Product Trace",
    },
    {
      path: "/environmental-impact",
      label: "Environmental Impact",
    },
    {
      path: "/climate-lab",
      label: "Climate Lab",
    },
    {
      path: "/research-data-lab",
      label: "Research Data Lab",
    },
    {
      path: "/carbon-methane",
      label: "Carbon & Methane",
    },
    {
      path: "/satellite-gis",
      label: "Satellite & GIS",
    },
    {
      path: "/treatment-simulation",
      label: "Treatment Simulation",
    },
    {
      path: "/waste-manifest",
      label: "Waste Manifest",
    },
    {
      path: "/waste-reports",
      label: "Waste Reports",
    },
    {
      path: "/report-waste",
      label: "Report Waste Issue",
    },
    {
      path: "/pickup-request",
      label: "Pickup Request",
    },
    {
      path: "/complaint-tracking",
      label: "Complaint Tracking",
    },
    {
      path: "/waste-awareness",
      label: "Waste Awareness",
    },
    {
      path: "/waste-marketplace",
      label: "EcoExchange",
    },
    {
      path: "/route-optimization",
      label: "Route Optimization",
    },
    {
      path: "/rewards",
      label: "EcoCoins & Rewards",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">
          ECOVERSE INTELLIGENCE
        </div>

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-dot" />
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="data-status">
          <span className="status-dot" />
          Data systems operational
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;