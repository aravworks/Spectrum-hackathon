import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register/register.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Consumer",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    const account = {
      name: form.name,
      email: form.email.toLowerCase(),
      password: form.password,
      role: form.role,
    };

    localStorage.setItem("ecoverseUser", JSON.stringify(account));

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="login-brand">
          <div className="brand-mark">E</div>

          <div>
            <div className="brand-name">ECOVERSE</div>
            <div className="brand-subtitle">
              Environmental Intelligence
            </div>
          </div>
        </div>

        <div className="login-message">

          <div className="eyebrow">
            JOIN THE ECOVERSE
          </div>

          <h1>
            Make the hidden
            <br />
            <span>lifecycle visible.</span>
          </h1>

          <p>
            Create your workspace to explore product lifecycles,
            environmental impact, resource use and waste traceability.
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

      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">
            <div className="eyebrow">
              CREATE ACCOUNT
            </div>

            <h2>Join ECOVERSE</h2>

            <p>
              Create your environmental intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <label>
              Full name

              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email address

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Select role

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="role-select"
              >
                <option value="Consumer">Consumer</option>
                <option value="Company">Company</option>
                <option value="Researcher">Researcher</option>
                <option value="Authority">Authority</option>
              </select>
            </label>

            {message && (
              <div className="login-error">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Create account →
            </button>

          </form>

          <div className="register-footer">
            Already have an account?

            <Link to="/login">
              Sign in
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default RegisterPage;