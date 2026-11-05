import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { API_URL, getApiUrl } from "../config/api";

// Safe API URL resolution fallback
const resolvedApiUrl =
  (typeof API_URL !== "undefined" && API_URL) ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        typeof getApiUrl === "function"
          ? getApiUrl("/auth/login")
          : `${resolvedApiUrl}/auth/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { message: `Server error (${res.status})` };
      }

      if (res.ok && data) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        const loggedUser = {
          ...data.user,
          role: data.user?.email === "khuzi56@gmail.com" ? "admin" : "user",
        };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setSuccess(true);
        setTimeout(() => {
          loggedUser.role === "admin"
            ? navigate("/admin/dashboard")
            : navigate("/dashboard");
        }, 1400);
      } else {
        setError(data?.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError(
        err?.message && !err.message.includes("fetch") && !err.message.includes("Failed")
          ? err.message
          : "Unable to connect to server. Please verify backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer vibrant royal blue container
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1d63ed] via-[#1a56db] to-[#1242ac] p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1a56db] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 text-white">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Signed In Successfully</h3>
              <p className="text-gray-500 text-xs mt-1.5">
                Authentication verified. Redirecting to workspace...
              </p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-5 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.3, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#1a56db] to-[#3b82f6]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[940px] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_70px_rgba(10,35,90,0.35)] overflow-hidden flex flex-col md:flex-row relative z-10 my-auto"
      >
        {/* ======================================================== */}
        {/* LEFT PANEL: 3D Blue Floating Spheres & Welcome Section    */}
        {/* ======================================================== */}
        <div className="w-full md:w-[46%] bg-gradient-to-br from-[#1d63ed] via-[#1a56db] to-[#1242ac] p-7 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] md:min-h-[560px]">
          
          {/* Large soft organic curve that extends gracefully to the right */}
          <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-[#206af6] opacity-70 pointer-events-none" />

          {/* 3D Realistic Sphere 1 (Bottom Left) */}
          <div
            className="absolute -bottom-14 -left-12 w-48 h-48 sm:w-56 sm:h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #60a5fa 0%, #2563eb 35%, #1d4ed8 70%, #0f358a 100%)",
              boxShadow:
                "0 20px 40px -10px rgba(8, 25, 75, 0.5), inset -6px -6px 16px rgba(5, 18, 55, 0.6)",
            }}
          />

          {/* 3D Realistic Sphere 2 (Center Overlapping the boundary into right panel) */}
          <div
            className="absolute -bottom-6 -right-10 md:-right-14 w-36 h-36 sm:w-44 sm:h-44 rounded-full z-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #70aefb 0%, #296bec 35%, #1852c9 70%, #0e378c 100%)",
              boxShadow:
                "0 25px 45px -8px rgba(8, 25, 75, 0.55), inset -8px -8px 20px rgba(5, 18, 55, 0.65)",
            }}
          />

          {/* Top Brand / Headline */}
          <div className="relative z-10 pt-2 sm:pt-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider uppercase text-white drop-shadow-sm leading-tight">
              Welcome
            </h1>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-blue-100 uppercase mt-2">
              Your Headline Name
            </p>
            <p className="text-xs text-blue-100/75 leading-relaxed mt-4 max-w-[280px] hidden sm:block">
              Experience seamless management, real-time sync, and secured authentication in one unified portal.
            </p>
          </div>

          {/* Bottom subtle info / status */}
          <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-2 text-[11px] text-blue-200/80 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Cloud Access</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Pure White Minimalist Login Form           */}
        {/* ======================================================== */}
        <div className="w-full md:w-[54%] bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          
          {/* Subtle 3D Sphere peeking into bottom-right corner (as in reference image) */}
          <div
            className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full pointer-events-none hidden sm:block opacity-90"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #70aefb 0%, #2563eb 35%, #1d4ed8 70%, #0f358a 100%)",
              boxShadow:
                "0 15px 35px -5px rgba(8, 25, 75, 0.4), inset -5px -5px 14px rgba(5, 18, 55, 0.5)",
            }}
          />

          <div className="relative z-10 max-w-[360px] w-full mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your registered details to access your account.
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 font-medium"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span className="truncate">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* User Name / Email Input Field */}
              <div className="relative flex items-center rounded-xl bg-[#f4f6fa] border border-gray-100 hover:border-gray-200 focus-within:border-[#1a56db] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1a56db]/10 transition-all">
                <div className="pl-3.5 pr-2 text-gray-400 flex items-center justify-center">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="User Name or Email"
                  required
                  className="w-full py-3 pr-3.5 bg-transparent text-gray-800 text-xs sm:text-sm placeholder-gray-400 outline-none font-medium"
                />
              </div>

              {/* Password Input Field with SHOW/HIDE button */}
              <div className="relative flex items-center rounded-xl bg-[#f4f6fa] border border-gray-100 hover:border-gray-200 focus-within:border-[#1a56db] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1a56db]/10 transition-all">
                <div className="pl-3.5 pr-2 text-gray-400 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full py-3 pr-16 bg-transparent text-gray-800 text-xs sm:text-sm placeholder-gray-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[11px] font-bold uppercase tracking-wider text-[#1a56db] hover:text-[#1242ac] px-1 py-1 transition-colors cursor-pointer select-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-500 hover:text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db]/20 accent-[#1a56db] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your administrator at khuzi56@gmail.com to reset credentials.");
                  }}
                  className="text-xs font-semibold text-[#1a56db] hover:underline transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#1242ac] hover:bg-[#0e378c] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 absolute">
                Or
              </span>
            </div>

            {/* Secondary Sign In with Other Button */}
            <button
              type="button"
              onClick={() => alert("Google SSO is configured in production environment.")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-800 hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <FcGoogle size={18} />
              <span>Sign in with other</span>
            </button>

            {/* Footer Navigation */}
            <div className="mt-5 text-center text-xs text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-[#1a56db] hover:underline ml-1"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
