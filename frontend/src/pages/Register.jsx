import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Mail, Lock, Rocket, ArrowLeft } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden text-slate-200 font-sans px-6">
      
      {/* Background Glow for Register (Indigo) */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#020617]/95 z-50 flex items-center justify-center backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0f172a] p-12 rounded-3xl border border-indigo-500/40 flex flex-col items-center">
              <CheckCircle size={50} className="text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold tracking-tight text-white italic">Success!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // Fixed Height (650px) - Center Balanced
        className="bg-[#0f172a]/50 backdrop-blur-2xl w-full max-w-[950px] h-[620px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-white/10"
      >
        {/* BRAND PANEL */}
        <div className="hidden md:flex w-[40%] bg-gradient-to-tr from-[#0f172a] to-[#1e1b4b] p-12 flex-col justify-between border-l border-white/5">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Rocket className="text-white" size={26} />
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">Create <br /><span className="text-indigo-400">Account.</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] font-bold uppercase">Membership Portal</p>
        </div>

        {/* FORM PANEL */}
        <div className="w-full md:w-[60%] p-10 md:p-14 flex flex-col justify-center">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 text-[10px] font-black tracking-widest uppercase transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </button>

          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input type="text" className="w-full bg-[#1e293b]/30 border border-white/10 text-white pl-12 py-3 rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input type="email" className="w-full bg-[#1e293b]/30 border border-white/10 text-white pl-12 py-3 rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" placeholder="email@kwd.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input type="password" className="w-full bg-[#1e293b]/30 border border-white/10 text-white pl-12 py-3 rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/10 mt-6 transition-all active:scale-[0.98]">
              Join Workspace
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
export default Register;