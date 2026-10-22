import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { User, Camera, X, Check, Mail, Phone, ShieldCheck, Globe, Cpu, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Profile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!stored || !stored._id) return;
    fetch(`http://localhost:5000/auth/profile/${stored._id}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setForm(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const saveProfile = async () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("gender", form.gender);
    fd.append("bio", form.bio);
    fd.append("phone", form.phone || "");
    if (image) fd.append("image", image);

    const res = await fetch(`http://localhost:5000/auth/profile/${user._id}`, {
      method: "PUT",
      body: fd,
    });

    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new CustomEvent("userUpdated", { detail: data.user }));
    setOpen(false);
  };

  if (!user) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-200">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />

        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative z-10">
          
          {/* Top Hero Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                My <span className="text-cyan-500 text-stroke-white">Profile</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-[2px] w-12 bg-cyan-500" />
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500">Neural Identity Verification</p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full flex items-center gap-2"
            >
              Update Profile <Edit3 size={14} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Main ID Card (Bento Style) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="lg:col-span-4 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                 <Cpu className="text-cyan-500" size={40} />
              </div>
              <div className="flex flex-col items-center">
                <div className="relative p-2 rounded-full border border-cyan-500/30">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {user.image ? (
                      <img src={`http://localhost:5000/uploads/${user.image}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400"><User size={48} /></div>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-black mt-6 text-white tracking-tight text-center">{user.name}</h2>
                <span className="mt-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest text-cyan-500">
                  Core User Node
                </span>
                
                <div className="w-full mt-10 space-y-3">
                  <DetailLine label="NODE ID" value={user._id.slice(-8).toUpperCase()} />
                  <DetailLine label="SYSTEM MAIL" value={user.email} />
                </div>
              </div>
            </motion.div>

            {/* 2. Detailed Specs (Bento Style) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md"
            >
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-500 mb-8 flex items-center gap-2">
                <ShieldCheck size={14}/> Authentication Metadata
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SpecItem icon={<Mail className="text-slate-500"/>} label="Primary Contact" value={user.email} />
                <SpecItem icon={<Phone className="text-slate-500"/>} label="Secure Line" value={user.phone || "UNSET"} />
                <SpecItem icon={<Globe className="text-slate-500"/>} label="Gender Spec" value={user.gender || "UNSET"} />
                <SpecItem icon={<Check className="text-emerald-500"/>} label="Account Status" value="SECURE" />
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-black/40 border border-white/5 relative">
                 <div className="absolute -top-3 left-6 px-3 bg-[#020617] text-[9px] font-black tracking-widest text-slate-500">BIOGRAPHY MODULE</div>
                 <p className="text-sm italic text-slate-400 leading-relaxed">
                   {user.bio || "The user has not yet initialized a professional biography sequence."}
                 </p>
              </div>
            </motion.div>

          </div>
        </main>

        {/* --- EDIT MODAL (The Taj Mahal Popup) --- */}
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
              />
              
              <motion.div 
                initial={{ rotateX: 20, y: 50, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                exit={{ rotateX: 20, y: 50, opacity: 0 }}
                className="bg-[#0f172a] border border-cyan-500/30 w-full max-w-2xl rounded-[3rem] p-1 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative z-10"
              >
                <div className="bg-[#020617] rounded-[2.8rem] p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Modify <span className="text-cyan-500">Core</span></h2>
                      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1 italic">Rewrite your digital history</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                      <X size={20}/>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: Avatar Change */}
                    <div className="md:col-span-4 flex flex-col items-center space-y-4">
                      <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-cyan-500 transition-all">
                          <img src={image ? URL.createObjectURL(image) : user.image ? `http://localhost:5000/uploads/${user.image}` : ""} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                          <Camera className="text-white" size={24} />
                          <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
                        </label>
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Click to overwrite image</p>
                    </div>

                    {/* Right: Form Inputs */}
                    <div className="md:col-span-8 space-y-5">
                      <CyberInput label="Name" value={form.name} onChange={(v) => setForm({...form, name: v})} />
                      <div className="grid grid-cols-2 gap-4">
                        <CyberInput label="Phone |Number" value={form.phone} onChange={(v) => setForm({...form, phone: v})} type="number" />
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 italic">Gender</p>
                           <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 appearance-none" value={form.gender || ""} onChange={(e) => setForm({...form, gender: e.target.value})}>
                              <option className="bg-black">Male</option>
                              <option className="bg-black">Female</option>
                           </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 italic">Bio</p>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 resize-none h-24" value={form.bio || ""} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Input neural bio data..." />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-12">
                    <button onClick={() => setOpen(false)} className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all">Cancel</button>
                    <button onClick={saveProfile} className="flex-1 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Update Profile</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Custom Atomic Components for the "Taj Mahal" feel
const DetailLine = ({ label, value }) => (
  <div className="flex justify-between border-b border-white/5 pb-2">
    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold text-white truncate max-w-[150px]">{value}</span>
  </div>
);

const SpecItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

const CyberInput = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 italic">{label}</p>
    <input 
      type={type} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-all shadow-inner"
      value={value || ""} onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Profile;