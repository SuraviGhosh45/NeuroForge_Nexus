import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.terms) {
      newErrors.terms = "You must agree to the terms and conditions.";
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

    const result = register({
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.success) {
      setMessage(
        result.message || "Unable to create your account."
      );
      return;
    }

    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <div className="auth-heading">
          <div className="icon-circle">+</div>

          <h2>Create your account</h2>

          <p>
            Join your NeuroForge Nexus workspace
          </p>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              className={
                errors.fullName ? "input-error" : ""
              }
            />

            {errors.fullName && (
              <small className="error-text">
                {errors.fullName}
              </small>
            )}
          </div>

          {/* Email */}
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
              className={
                errors.email ? "input-error" : ""
              }
            />

            {errors.email && (
              <small className="error-text">
                {errors.email}
              </small>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={
                  errors.confirmPassword
                    ? "input-error"
                    : ""
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                aria-label="Toggle password visibility"
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

          {/* Terms */}
          <label className="remember-row">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />

            <span>
              I agree to the terms and conditions
            </span>
          </label>

          {errors.terms && (
            <small className="error-text">
              {errors.terms}
            </small>
          )}

          {/* Register */}
          <button
            type="submit"
            className="primary-button"
          >
            Create Account <span>→</span>
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
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

export default Register;