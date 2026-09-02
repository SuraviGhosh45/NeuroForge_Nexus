import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLES = ["Admin", "Project Lead", "Project Manager", "Team Lead", "Developer", "Tester", "QA"];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", role: "", team: "", terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email address.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8) newErrors.password = "Password must contain at least 8 characters.";
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!form.role) newErrors.role = "Please select a role.";
    if (!form.team.trim()) newErrors.team = "Team name is required.";
    if (!form.terms) newErrors.terms = "You must accept the terms to continue.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const result = await register({
    username: form.fullName,
    email: form.email,
    password: form.password,
  });

  if (!result.success) {
    setMessage(result.message);
    return;
  }

  setMessage("Registration successful. Redirecting to login...");
  navigate("/login");
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
              id="fullName" name="fullName" type="text" placeholder="Enter your full name"
              value={form.fullName} onChange={handleChange}
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && <small className="error-text">{errors.fullName}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Work Email</label>
            <input
              id="register-email" name="email" type="email" placeholder="you@company.com"
              value={form.email} onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>

          <div className="two-column">
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <div className="password-wrapper">
                <input
                  id="register-password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters" value={form.password} onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <small className="error-text">{errors.password}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((p) => !p)}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
            </div>
          </div>

          <div className="two-column">
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role" name="role" value={form.role} onChange={handleChange}
                className={errors.role ? "input-error" : ""}
              >
                <option value="">Select your role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && <small className="error-text">{errors.role}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="team">Team</label>
              <input
                id="team" name="team" type="text" placeholder="e.g. Payments Team"
                value={form.team} onChange={handleChange}
                className={errors.team ? "input-error" : ""}
              />
              {errors.team && <small className="error-text">{errors.team}</small>}
            </div>
          </div>

          <label className="terms-row">
            <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
            <span>I agree to the organization's security and platform policies.</span>
          </label>
          {errors.terms && <small className="error-text">{errors.terms}</small>}

          <button type="submit" className="primary-button">
            Create Account <span>→</span>
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
};

export default Register;