import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        const loggedUser = {
          ...data.user,
          role: data.user.email === "khuzi56@gmail.com" ? "admin" : "user",
        };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setSuccess(true);
        setTimeout(() => {
          loggedUser.role === "admin"
            ? navigate("/admin/dashboard")
            : navigate("/dashboard");
        }, 1500);
      } else {
        setError(data.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Desktop par zero scrolling (md:h-screen md:overflow-hidden), mobile par smooth responsive flow
    <div className="min-h-screen md:h-screen w-full flex items-center justify-center bg-[#060913] relative overflow-y-auto md:overflow-hidden text-slate-100 font-sans px-4 sm:px-6 py-6 md:py-0 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glows & Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
                <CheckCircle2 size={36} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Access Granted</h3>
              <p className="text-slate-400 text-xs mt-1.5">
                Authentication successful. Redirecting to workspace...
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[960px] md:h-[580px] md:max-h-[92vh] bg-slate-900/75 backdrop-blur-2xl border border-white/10 rounded-2.5xl sm:rounded-[2.2rem] shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col md:flex-row my-auto"
      >
        {/* LEFT BRAND & HERO PANEL (Desktop only) */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-8 lg:p-9 flex-col justify-between border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo / App Title */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide mb-6">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Next-Gen Cloud Portal</span>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <ShieldCheck size={22} className="text-slate-950 font-bold" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">KWD Workspace</h1>
                <p className="text-[11px] text-slate-400">Enterprise Cloud v2.5</p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight mt-4">
              Welcome <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Back to Control.
              </span>
            </h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Seamlessly monitor real-time orders, manage inventory, and collaborate across teams.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5 mt-6">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Zap size={15} />
                </div>
                <div className="text-[11px]">
                  <p className="font-semibold text-slate-200">Real-time Synchronization</p>
                  <p className="text-slate-400">Instant updates across all channels</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <div className="text-[11px]">
                  <p className="font-semibold text-slate-200">Enterprise Grade Security</p>
                  <p className="text-slate-400">Role-based controls & 256-bit protection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Indicator */}
          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems Operational</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">v2.5.0</span>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="w-full md:w-[58%] p-5 sm:p-8 lg:p-9 flex flex-col justify-center relative overflow-hidden">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Sign In
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px]">
                <ShieldCheck size={13} />
                <span>KWD Auth</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Error Alert Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs"
              >
                <AlertCircle size={15} className="text-rose-400 shrink-0" />
                <span className="font-medium truncate">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 tracking-wide block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all duration-200 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 hover:border-white/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 tracking-wide block">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your administrator at khuzi56@gmail.com to reset credentials.");
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-9 pr-9 py-2.5 outline-none transition-all duration-200 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:via-teal-300 hover:to-blue-400 text-slate-950 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </>
              )}
            </button>
          </form>

          {/* Social Auth - ONLY Continue with Google */}
          <div className="mt-4">
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0f172a] px-2.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 absolute">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert("Google SSO is configured in production environment.")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <FcGoogle size={18} />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ml-1"
            >
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
