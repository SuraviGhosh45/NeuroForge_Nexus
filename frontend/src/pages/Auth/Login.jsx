import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
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

    setMessage(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
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
    setMessage(null);

    try {
      const result = await login(form.email, form.password, form.remember);

      if (!result.success) {
        setMessage({
          text: result.message || "Invalid email or password. Please try again.",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setMessage({
        text: "An unexpected error occurred during sign-in.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <section className="relative overflow-hidden rounded-2xl border border-[#e8eef8]/15 bg-[#0d1a2b]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/70 transition-all">
          {/* Subtle Top Gradient Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

          {/* Heading (No icons) */}
          <div className="text-left mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-[#e8eef8]/60">
              Sign in to your NeuroForge Nexus workspace
            </p>
          </div>

          {/* Informational or Error Alert Message */}
          {message && (
            <div
              className={`mb-5 rounded-xl border p-3.5 text-xs transition ${
                message.type === "info"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
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
                placeholder="you@company.com"
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

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setMessage({
                      text: "Password reset instructions will be sent to your registered email.",
                      type: "info",
                    })
                  }
                  className="text-xs text-blue-400 hover:text-blue-300 transition hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            {/* Remember Me - Small, left-aligned */}
            <div className="pt-1 flex items-center justify-start">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#e8eef8]/60 hover:text-[#e8eef8]/80 select-none transition">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-3.5 w-3.5 rounded border-[#e8eef8]/20 bg-[#07111f] text-blue-600 focus:ring-0 cursor-pointer accent-blue-500 shrink-0"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
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

          {/* Switch to Register */}
          <p className="text-center text-xs text-[#e8eef8]/60">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition"
            >
              Create an account
            </Link>
          </p>

          {/* Quick Role Test Logins */}
          <div className="mt-5 border-t border-[#e8eef8]/10 pt-4">
            <p className="text-[10px] font-semibold text-[#e8eef8]/50 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Test Logins
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => setForm({ email: "sophia.martinez@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "marcus.chen@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                Project Lead
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "elena.rostova@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
              >
                Project Manager
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "david.kim@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                Team Lead
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "aria.takahashi@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
              >
                Tester
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "lucas.silva@neuroforge.io", password: "password", remember: false })}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
              >
                QA
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "suravighosh45@gmail.com", password: "password", remember: false })}
                className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-300 hover:bg-purple-500/20 transition cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-4 border-t border-[#e8eef8]/10 pt-3 text-center text-[11px] text-[#e8eef8]/40">
            Enterprise IAM • 256-Bit SSL Encrypted
          </div>
        </section>
      </div>
    </AuthLayout>
  );
};

export default Login;