import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing">

      <header className="landing-nav">

        <Link to="/" className="brand">
          <div className="brand-mark">E</div>

          <div>
            <div className="brand-name">ECOVERSE</div>
            <div className="brand-subtitle">
              Environmental Intelligence
            </div>
          </div>
        </Link>

        <div className="landing-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/consumer">Trace Product</Link>
          <Link to="/climate-lab">Climate Lab</Link>
        </div>

        <Link to="/dashboard" className="dark-button">
          Explore Platform →
        </Link>

      </header>

      <section className="hero">

        <div className="hero-left">

          <div className="eyebrow">
            ENVIRONMENTAL INTELLIGENCE PLATFORM
          </div>

          <h1>
            Where does a
            <br />
            product <span>really go?</span>
          </h1>

          <p>
            ECOVERSE traces products from raw materials and
            manufacturing to consumption, reuse, recycling
            and final disposal.
          </p>

          <div className="hero-buttons">

            <Link
              to="/dashboard"
              className="dark-button large"
            >
              Explore Intelligence →
            </Link>

            <Link
              to="/consumer"
              className="light-button large"
            >
              Trace a Product
            </Link>

          </div>

          <div className="pillars-mini">
            TRACE
            <span>•</span>
            VERIFY
            <span>•</span>
            MEASURE
            <span>•</span>
            UNDERSTAND
            <span>•</span>
            RESEARCH
          </div>

        </div>

        <div className="trace-preview">

          <div className="preview-label">
            LIVE PRODUCT TRACE
          </div>

          <h2>Organic Cotton T-Shirt</h2>

          {[
            ["01", "Raw Material", "Cotton"],
            ["02", "Manufacturing", "Tiruppur, India"],
            ["03", "Distribution", "Supply Chain"],
            ["04", "Consumption", "Consumer"],
            ["05", "End of Life", "Traceability Gap"],
          ].map((item) => (
            <div className="preview-stage" key={item[0]}>

              <div className="stage-number">
                {item[0]}
              </div>

              <div className="stage-info">
                <strong>{item[1]}</strong>
                <span>{item[2]}</span>
              </div>

            </div>
          ))}

          <div className="preview-stats">

            <div>
              <strong>76.4%</strong>
              <span>TRACEABILITY</span>
            </div>

            <div>
              <strong>18.2 kg</strong>
              <span>MODELLED IMPACT</span>
            </div>

          </div>

        </div>

      </section>

      <section className="landing-stats">

        <div>
          <strong>12.4K</strong>
          <span>Products Traced</span>
        </div>

        <div>
          <strong>8.7M kg</strong>
          <span>Material Flow</span>
        </div>

        <div>
          <strong>2.1M kg</strong>
          <span>Waste Recovered</span>
        </div>

        <div>
          <strong>18.6%</strong>
          <span>Unknown End-of-Life</span>
        </div>

      </section>

      <section className="landing-question">

        <div className="eyebrow">
          THE CENTRAL QUESTION
        </div>

        <h2>
          We know what people buy.
          <br />
          But do we know what happens next?
        </h2>

        <p>
          ECOVERSE connects product lifecycle information,
          environmental indicators, waste flows and
          traceability gaps into one intelligence platform.
        </p>

      </section>

      <section className="landing-pillars">

        <div className="eyebrow">
          FIVE CORE PILLARS
        </div>

        <h2>
          From product data to
          <br />
          environmental intelligence.
        </h2>

        <div className="pillar-grid">

          {[
            ["01", "TRACE"],
            ["02", "VERIFY"],
            ["03", "MEASURE"],
            ["04", "UNDERSTAND"],
            ["05", "RESEARCH"],
          ].map(([number, title]) => (
            <div className="pillar" key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>
                Explore lifecycle information and
                environmental intelligence.
              </p>
            </div>
          ))}

        </div>

      </section>

      <footer className="footer">
        <strong>ECOVERSE</strong>
        <span>
          TRACE • VERIFY • MEASURE • UNDERSTAND • RESEARCH
        </span>
      </footer>

    </div>
  );
}

export default LandingPage;