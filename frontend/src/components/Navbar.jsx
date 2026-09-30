import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <div className="brand-mark">E</div>

        <div>
          <div className="brand-name">ECOVERSE</div>
          <div className="brand-subtitle">
            Environmental Intelligence
          </div>
        </div>
      </Link>

      <div className="navbar-actions">
        <Link to="/consumer" className="nav-search">
          Search Product
        </Link>

        <Link to="/dashboard" className="nav-dashboard">
          Dashboard
        </Link>
      </div>
    </header>
  );
}

export default Navbar;