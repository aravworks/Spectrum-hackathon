import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const demoUsers = {
  consumer: {
    email: "consumer@ecoverse.demo",
    password: "123456",
    role: "Consumer",
  },

  company: {
    email: "company@ecoverse.demo",
    password: "123456",
    role: "Company",
  },

  researcher: {
    email: "researcher@ecoverse.demo",
    password: "123456",
    role: "Researcher",
  },

  authority: {
    email: "authority@ecoverse.demo",
    password: "123456",
    role: "Authority",
  },
};

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = Object.values(demoUsers).find(
      (item) =>
        item.email === normalizedEmail &&
        item.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "ecoverseUser",
      JSON.stringify(user)
    );

    navigate("/dashboard");
  };

  const fillDemo = (type) => {
    const user = demoUsers[type];

    setEmail(user.email);
    setPassword(user.password);
    setError("");
  };

  return (
    <div className="login-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="login-left">

        <div className="login-brand">

          <div className="brand-mark">
            E
          </div>

          <div>
            <div className="brand-name">
              ECOVERSE
            </div>

            <div className="brand-subtitle">
              Environmental Intelligence
            </div>
          </div>

        </div>

        <div className="login-message">

          <div className="eyebrow">
            ENVIRONMENTAL INTELLIGENCE PLATFORM
          </div>

          <h1>
            Make the hidden
            <br />
            <span>lifecycle visible.</span>
          </h1>

          <p>
            Trace products, understand resource use,
            follow waste movement and identify
            environmental data gaps.
          </p>

          <div className="login-points">

            <div>
              <strong>01</strong>
              <span>TRACE</span>
            </div>

            <div>
              <strong>02</strong>
              <span>VERIFY</span>
            </div>

            <div>
              <strong>03</strong>
              <span>MEASURE</span>
            </div>

            <div>
              <strong>04</strong>
              <span>UNDERSTAND</span>
            </div>

          </div>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">

            <div className="eyebrow">
              SECURE ACCESS
            </div>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your ECOVERSE workspace.
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <label>
              Email address

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </label>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Sign in →
            </button>

          </form>

          {/* CREATE ACCOUNT */}

          <div className="register-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create account
            </Link>

          </div>

          {/* DEMO ACCOUNTS */}

          <div className="demo-login">

            <div className="demo-login-title">
              DEMO ACCOUNTS
            </div>

            <div className="demo-buttons">

              <button
                type="button"
                onClick={() => fillDemo("consumer")}
              >
                Consumer
              </button>

              <button
                type="button"
                onClick={() => fillDemo("company")}
              >
                Company
              </button>

              <button
                type="button"
                onClick={() => fillDemo("researcher")}
              >
                Researcher
              </button>

              <button
                type="button"
                onClick={() => fillDemo("authority")}
              >
                Authority
              </button>

            </div>

            <p>
              Demo password:{" "}
              <strong>123456</strong>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;