import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
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

    const result = login(form.email);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <div className="auth-heading">
          <div className="icon-circle">↪</div>

          <h2>Welcome back</h2>

          <p>
            Sign in to your NeuroForge Nexus workspace
          </p>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">
              Work Email
            </label>

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
              <small className="error-text">
                {errors.email}
              </small>
            )}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  setMessage(
                    "Password recovery will be integrated later."
                  )
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
                className={
                  errors.password ? "input-error" : ""
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <small className="error-text">
                {errors.password}
              </small>
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

          <button
            type="submit"
            className="primary-button"
          >
            Sign In <span>→</span>
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

        <div className="iam-note">
          <span>🔐</span>

          <div>
            <strong>Secure authentication</strong>

            <p>
              IAM powered by Keycloak
            </p>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
};

export default Login;