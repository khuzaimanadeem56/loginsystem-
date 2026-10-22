import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
        loggedUser.role === "admin" ? navigate("/admin/dashboard") : navigate("/dashboard");
      }, 1500);
    }
  };

  return (
    // h-screen aur overflow-hidden se scrolling bilkul band ho jayegi
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden text-slate-200 font-sans px-6">
      
      {/* Background Animated Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#020617]/90 flex items-center justify-center z-50 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl p-10 flex flex-col items-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
              <CheckCircle size={50} className="text-cyan-400 mb-4" />
              <h2 className="text-2xl font-bold">Authenticated</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // Fixed Height (600px) taaki center mein fix nazar aaye
        className="bg-[#0f172a]/50 backdrop-blur-2xl w-full max-w-[950px] h-[580px] rounded-[2.5rem] shadow-2xl overflow-hidden flex border border-white/10"
      >
        {/* LEFT SECTION */}
        <div className="hidden md:flex w-[40%] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-12 flex-col justify-between border-r border-white/5">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
               <ShieldCheck className="text-[#020617]" size={28} />
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Welcome <br /> <span className="text-cyan-400">Back.</span>
            </h2>
          </div>
          <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">System v2.0</p>
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-[60%] p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Login</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input type="email" className="w-full bg-[#1e293b]/30 border border-white/10 text-white pl-12 py-3 rounded-2xl focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all placeholder:text-slate-600" placeholder="user@kwd.com" onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input type="password" className="w-full bg-[#1e293b]/30 border border-white/10 text-white pl-12 py-3 rounded-2xl focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all placeholder:text-slate-600" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#020617] py-4 rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/10 mt-4 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              Sign In <ArrowRight size={20} />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account? <Link to="/register" className="text-white font-bold hover:text-cyan-400 transition-colors ml-1 border-b border-white/20 hover:border-cyan-400">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
export default Login;