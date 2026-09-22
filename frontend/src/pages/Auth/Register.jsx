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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      newErrors.email = "Please enter a valid work email address.";
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
      newErrors.terms = "You must agree to the terms and privacy policy.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await register({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (!result.success) {
        setMessage(result.message || "Unable to create your account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setMessage("An unexpected error occurred during account creation.");
      setIsSubmitting(false);
    }
  };

  const hasValidLength = form.password.length >= 6;
  const passwordsMatch =
    hasValidLength &&
    form.confirmPassword &&
    form.password === form.confirmPassword;
  const passwordsMismatch =
    Boolean(form.confirmPassword) &&
    form.password !== form.confirmPassword;

  return (
    <AuthLayout>
      <div className="w-full max-w-xl">
        <section className="relative overflow-hidden rounded-2xl border border-[#e8eef8]/15 bg-[#0d1a2b]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/70 transition-all">
          {/* Subtle Top Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />

          {/* Heading (No icons) */}
          <div className="text-left mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-[#e8eef8]/60">
              Join your team on the NeuroForge Nexus SDLC platform
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Grid 2-cols: Full Name and Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#07111f]/90 px-4 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/45 outline-none transition ${
                    errors.fullName
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-[#e8eef8]/15 hover:border-[#e8eef8]/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
                >
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#07111f]/90 px-4 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/45 outline-none transition ${
                    errors.email
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-[#e8eef8]/15 hover:border-[#e8eef8]/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Grid 2-cols: Password and Confirm Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-[#07111f]/90 pl-4 pr-16 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/45 outline-none transition ${
                      errors.password
                        ? "border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-[#e8eef8]/15 hover:border-[#e8eef8]/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-xs font-medium text-[#e8eef8]/40 hover:text-white transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
                  >
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-[11px] font-medium text-emerald-400">
                      Passwords match
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[11px] font-medium text-rose-400">
                      Passwords don't match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-[#07111f]/90 pl-4 pr-16 py-2.5 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/45 outline-none transition ${
                      errors.confirmPassword
                        ? "border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        : "border-[#e8eef8]/15 hover:border-[#e8eef8]/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-xs font-medium text-[#e8eef8]/40 hover:text-white transition"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Privacy Agreement - Small, left-aligned, top-aligned checkbox */}
            <div className="pt-1">
              <div className="flex items-start justify-start">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] text-[#e8eef8]/60 hover:text-[#e8eef8]/80 transition leading-normal">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={form.terms}
                    onChange={handleChange}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-[#e8eef8]/20 bg-[#07111f] text-blue-600 focus:ring-0 cursor-pointer accent-blue-500 shrink-0"
                  />
                  <span>
                    I agree to the{" "}
                    <span className="text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer">
                      Privacy Policy
                    </span>
                  </span>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8eef8]/10" />
            </div>
            <span className="relative bg-[#0d1a2b] px-3 text-[10px] font-semibold uppercase tracking-widest text-[#e8eef8]/40">
              OR
            </span>
          </div>

          {/* Switch to Login */}
          <p className="text-center text-xs text-[#e8eef8]/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition"
            >
              Sign in to your account
            </Link>
          </p>

          {/* Security Note */}
          <div className="mt-6 border-t border-[#e8eef8]/10 pt-4 text-center text-[11px] text-[#e8eef8]/40">
            IAM Powered by Keycloak • Enterprise-Grade Protection
          </div>
        </section>
      </div>
    </AuthLayout>
  );
};

export default Register;