import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login/login.css";

// Map backend UserRole enum values → frontend display names used by DashboardPage
const ROLE_MAP = {
  "CONSUMER":   "Consumer",
  "COLLECTOR":  "Company",
  "RECYCLER":   "Company",
  "CITY_ADMIN": "Authority",
  "SYS_ADMIN":  "Authority",
  "ANALYST":    "Researcher",
  "RESEARCHER": "Researcher",
};

const demoUsers = {
  consumer:   { email: "consumer@ecoverse.demo",   password: "123456", role: "Consumer" },
  company:    { email: "company@ecoverse.demo",    password: "123456", role: "Company" },
  researcher: { email: "researcher@ecoverse.demo", password: "123456", role: "Researcher" },
  authority:  { email: "authority@ecoverse.demo",  password: "123456", role: "Authority" },
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const formData = new URLSearchParams();
      formData.append("username", normalizedEmail);
      formData.append("password", password);

      const response = await fetch("https://spectrum-hackathon.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) throw new Error("Invalid email or password.");

      const data = await response.json();

      // Fetch user profile with the token
      const userRes = await fetch("https://spectrum-hackathon.onrender.com/api/v1/auth/test-token", {
        method: "POST",
        headers: { "Authorization": `Bearer ${data.access_token}` },
      });

      if (!userRes.ok) throw new Error("Failed to load user profile.");

      const userData = await userRes.json();

      // Map backend role enum (e.g. "CITY_ADMIN") → frontend display name (e.g. "Authority")
      const rawRole = (userData.role || "").toUpperCase();
      userData.role = ROLE_MAP[rawRole] || "Consumer";

      localStorage.setItem("ecoverseToken", data.access_token);
      localStorage.setItem("ecoverseUser", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    const user = demoUsers[type];
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark">E</div>
          <div>
            <div className="brand-name">ECOVERSE</div>
            <div className="brand-subtitle">Environmental Intelligence</div>
          </div>
        </div>

        <div className="login-message">
          <div className="eyebrow">ENVIRONMENTAL INTELLIGENCE PLATFORM</div>
          <h1>Make the hidden <br /><span>lifecycle visible.</span></h1>
          <p>Trace products, understand resource use, follow waste movement and identify environmental data gaps.</p>
          <div className="login-points">
            <div><strong>01</strong><span>TRACE</span></div>
            <div><strong>02</strong><span>VERIFY</span></div>
            <div><strong>03</strong><span>MEASURE</span></div>
            <div><strong>04</strong><span>UNDERSTAND</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="eyebrow">SECURE ACCESS</div>
            <h2>Welcome back</h2>
            <p>Sign in to your ECOVERSE workspace.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className="register-footer">
            <span>Don't have an account?</span>
            <Link to="/register">Create account</Link>
          </div>

          <div className="demo-login">
            <div className="demo-login-title">DEMO ACCOUNTS</div>
            <div className="demo-buttons">
              <button type="button" onClick={() => fillDemo("consumer")}>Consumer</button>
              <button type="button" onClick={() => fillDemo("company")}>Company</button>
              <button type="button" onClick={() => fillDemo("researcher")}>Researcher</button>
              <button type="button" onClick={() => fillDemo("authority")}>Authority</button>
            </div>
            <p>Demo password: <strong>123456</strong></p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;