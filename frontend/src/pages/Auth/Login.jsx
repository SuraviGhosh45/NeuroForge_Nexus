import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PiEye, PiEyeSlash, PiLockKey, PiEnvelope } from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result?.success) {
        setError(result?.message || "Invalid email or password.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            NeuroForge Nexus
          </h1>

          <p className="mt-2 text-sm text-[#9aa8bb]">
            Sign in to continue
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1929] p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#e8eef8]"
              >
                Email
              </label>

              <div className="relative">
                <PiEnvelope
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#728198]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#e8eef8]/10 bg-[#07111f] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500 placeholder:text-[#65748a] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#e8eef8]"
              >
                Password
              </label>

              <div className="relative">
                <PiLockKey
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#728198]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#e8eef8]/10 bg-[#07111f] py-3 pl-10 pr-11 text-sm text-white outline-none transition focus:border-blue-500 placeholder:text-[#65748a] disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#728198] hover:text-white disabled:opacity-50"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <PiEyeSlash size={19} />
                  ) : (
                    <PiEye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#9aa8bb]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-4 border-t border-[#e8eef8]/10 pt-3 text-center text-[11px] text-[#e8eef8]/40">
            Enterprise IAM • 256-Bit SSL Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;