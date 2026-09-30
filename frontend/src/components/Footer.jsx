import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>ECOVERSE</h2>

          <p>
            Environmental intelligence for understanding
            what happens to products, resources and waste
            across their lifecycle.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/dashboard">Dashboard</Link>
          <Link to="/consumer">Consumer</Link>
          <Link to="/research">Research</Link>
          <Link to="/climate-lab">Climate Lab</Link>
        </div>

        <div className="footer-column">
          <h4>Trace</h4>

          <Link to="/consumer">Product Passport</Link>
          <Link to="/environmental-impact">
            Environmental Impact
          </Link>
          <Link to="/community-reports">
            Community Reports
          </Link>
        </div>

        <div className="footer-column">
          <h4>Intelligence</h4>

          <Link to="/company">Company Data</Link>
          <Link to="/waste-manifest">Waste Manifest</Link>
          <Link to="/authority">Authority View</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 ECOVERSE</span>

        <span>
          TRACE · VERIFY · MEASURE · UNDERSTAND · RESEARCH
        </span>
      </div>
    </footer>
  );
}

export default Footer;