import { useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";

const ROLES = [
  "Admin",
  "Project Manager",
  "Developer",
  "Tester",
  "DevOps Engineer",
];

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">N</div>
      <div>
        <h1>NeuroForge</h1>
        <span>NEXUS</span>
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="topbar">
        <Logo />
        <div className="security-status">
          <span className="status-dot"></span>
          Enterprise Secure Platform
        </div>
      </header>

      <main className="auth-container">{children}</main>

      <footer className="auth-footer">
        <span>© 2026 NeuroForge Nexus</span>
        <span>Enterprise SDLC Management Platform</span>
      </footer>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setMessage(
      "Login form validated successfully. Backend authentication will be connected in the next phase."
    );
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <div className="auth-heading">
          <div className="icon-circle">↪</div>
          <h2>Welcome back</h2>
          <p>Sign in to your NeuroForge Nexus workspace</p>
        </div>

        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <small className="error-text">{errors.email}</small>
            )}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  setMessage("Password recovery will be integrated later.")
                }
              >
                Forgot password?
              </button>
            </div>

            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <small className="error-text">{errors.password}</small>
            )}
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          <button type="submit" className="primary-button">
            Sign In
            <span>→</span>
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Don't have an account?
          <Link to="/register">Create an account</Link>
        </p>

        <div className="iam-note">
          <span>🔐</span>
          <div>
            <strong>Secure authentication</strong>
            <p>IAM powered by Keycloak</p>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    team: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.role) {
      newErrors.role = "Please select a role.";
    }

    if (!form.team.trim()) {
      newErrors.team = "Team name is required.";
    }

    if (!form.terms) {
      newErrors.terms = "You must accept the terms to continue.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setMessage(
      "Registration form validated successfully. User creation will be connected to the backend and Keycloak in the next phase."
    );
  };

  return (
    <AuthLayout>
      <section className="auth-card register-card">
        <div className="auth-heading">
          <div className="icon-circle">+</div>
          <h2>Create your account</h2>
          <p>Join your organization's NeuroForge Nexus workspace</p>
        </div>

        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && (
              <small className="error-text">{errors.fullName}</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Work Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <small className="error-text">{errors.email}</small>
            )}
          </div>

          <div className="two-column">
            <div className="form-group">
              <label htmlFor="register-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <small className="error-text">{errors.password}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>

              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <small className="error-text">
                  {errors.confirmPassword}
                </small>
              )}
            </div>
          </div>

          <div className="two-column">
            <div className="form-group">
              <label htmlFor="role">Role</label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={errors.role ? "input-error" : ""}
              >
                <option value="">Select your role</option>

                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {errors.role && (
                <small className="error-text">{errors.role}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="team">Team</label>

              <input
                id="team"
                name="team"
                type="text"
                placeholder="e.g. Payments Team"
                value={form.team}
                onChange={handleChange}
                className={errors.team ? "input-error" : ""}
              />

              {errors.team && (
                <small className="error-text">{errors.team}</small>
              )}
            </div>
          </div>

          <label className="terms-row">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <span>
              I agree to the organization's security and platform policies.
            </span>
          </label>

          {errors.terms && (
            <small className="error-text">{errors.terms}</small>
          )}

          <button type="submit" className="primary-button">
            Create Account
            <span>→</span>
          </button>
        </form>

        <p className="switch-auth">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>

        <div className="iam-note">
          <span>🛡</span>
          <div>
            <strong>Enterprise identity</strong>
            <p>Role-based access through Keycloak IAM</p>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;