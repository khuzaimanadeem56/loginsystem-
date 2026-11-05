import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F111A] p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Background ambient glow blobs */}
      <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] bg-cyan-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-[#1A1D2B] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl shadow-black/50 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 text-white">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Signed In Successfully</h3>
              <p className="text-slate-400 text-xs mt-1.5">
                Authentication verified. Redirecting to workspace...
              </p>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-5 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.3, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[940px] bg-[#1A1D2B] border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row relative z-10 my-auto"
      >
        {/* ======================================================== */}
        {/* LEFT PANEL — Cyan 3D Spheres + Welcome Hero              */}
        {/* ======================================================== */}
        <div className="w-full md:w-[46%] bg-gradient-to-br from-[#0a1628] via-[#0c1f3a] to-[#071221] p-7 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] md:min-h-[560px]">

          {/* Cyan glow halo top-right */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/15 blur-[80px] pointer-events-none" />
          {/* Cyan glow bottom */}
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-cyan-600/10 blur-[70px] pointer-events-none" />

          {/* 3D Cyan Sphere 1 — Bottom Left (large) */}
          <div
            className="absolute -bottom-14 -left-12 w-48 h-48 sm:w-56 sm:h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 32% 32%, #67e8f9 0%, #06b6d4 30%, #0891b2 60%, #164e63 100%)",
              boxShadow:
                "0 20px 50px -10px rgba(6,182,212,0.35), inset -6px -6px 18px rgba(0,30,50,0.6)",
            }}
          />

          {/* 3D Cyan Sphere 2 — Bottom Right (medium, bleeds into right panel) */}
          <div
            className="absolute -bottom-6 -right-10 md:-right-14 w-36 h-36 sm:w-44 sm:h-44 rounded-full z-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 32% 32%, #a5f3fc 0%, #22d3ee 30%, #0891b2 60%, #0e4f68 100%)",
              boxShadow:
                "0 25px 55px -8px rgba(6,182,212,0.4), inset -8px -8px 22px rgba(0,30,50,0.65)",
            }}
          />

          {/* Top Brand / Welcome text */}
          <div className="relative z-10 pt-2 sm:pt-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-widest uppercase text-white drop-shadow leading-tight italic">
              Welcome
            </h1>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.26em] text-cyan-400 uppercase mt-2">
              Georgia Lottery Portal
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-4 max-w-[260px] hidden sm:block">
              Experience seamless management, real-time sync, and secured authentication in one unified portal.
            </p>
          </div>

          {/* Bottom status badge */}
          <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-2 text-[11px] text-cyan-300/70 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Cloud Access</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL — Dark Card Login Form                       */}
        {/* ======================================================== */}
        <div className="w-full md:w-[54%] bg-[#1A1D2B] p-7 sm:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">

          {/* Subtle cyan sphere peeking in from bottom-right corner */}
          <div
            className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full pointer-events-none hidden sm:block opacity-80"
            style={{
              background:
                "radial-gradient(circle at 32% 32%, #a5f3fc 0%, #22d3ee 30%, #0891b2 60%, #0e4f68 100%)",
              boxShadow:
                "0 15px 40px -5px rgba(6,182,212,0.3), inset -5px -5px 14px rgba(0,30,50,0.55)",
            }}
          />

          <div className="relative z-10 max-w-[360px] w-full mx-auto">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
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
                  className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-medium"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span className="truncate">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email Input */}
              <div className="group relative flex items-center rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 focus-within:border-cyan-500/60 focus-within:bg-slate-950/80 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                <div className="pl-3.5 pr-2 text-slate-500 group-focus-within:text-cyan-400 flex items-center justify-center transition-colors">
                  <User size={17} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full py-3 pr-3.5 bg-transparent text-white text-xs sm:text-sm placeholder-slate-600 outline-none font-medium"
                />
              </div>

              {/* Password Input with Show/Hide */}
              <div className="group relative flex items-center rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 focus-within:border-cyan-500/60 focus-within:bg-slate-950/80 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                <div className="pl-3.5 pr-2 text-slate-500 group-focus-within:text-cyan-400 flex items-center justify-center transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full py-3 pr-16 bg-transparent text-white text-xs sm:text-sm placeholder-slate-600 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[11px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 px-1 py-1 transition-colors cursor-pointer select-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 accent-cyan-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your administrator at khuzi56@gmail.com to reset credentials.");
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-cyan-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-white/8 w-full" />
              <span className="bg-[#1A1D2B] px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 absolute">
                Or
              </span>
            </div>

            {/* Secondary — Sign in with other */}
            <button
              type="button"
              onClick={() => alert("Google SSO is configured in production environment.")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
            >
              <FcGoogle size={18} />
              <span>Sign in with other</span>
            </button>

            {/* Footer Nav */}
            <div className="mt-5 text-center text-xs text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-cyan-400 hover:text-cyan-300 ml-1 transition-colors"
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