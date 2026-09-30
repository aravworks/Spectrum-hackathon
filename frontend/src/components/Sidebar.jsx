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
      path: "/waste-manifest",
      label: "Waste Manifest",
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