import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, User as UserIcon, Info, Search, Trash2, Edit3, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2"; // For beautiful alerts (npm install sweetalert2)
import { API_URL as API } from "../config/api";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API}/auth/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const location = useLocation();
  // After users load, if hash present, scroll to that user card
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace('#','');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, location.hash]);

  // DELETE FUNCTION
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#06b6d4',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      background: '#020617',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API}/auth/users/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          Swal.fire({ title: 'Deleted!', icon: 'success', background: '#020617', color: '#fff' });
          fetchUsers(); // List refresh karein
        }
      } catch (err) {
        Swal.fire('Error', 'Could not delete user', 'error');
      }
    }
  };

  // Filter Users based on search
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-300 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar user={currentUser} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black tracking-tighter text-white uppercase italic"
              >
                User <span className="text-cyan-500">Profiles</span>
              </motion.h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic italic">
                System Registry // {filteredUsers.length} Nodes Found
              </p>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..." 
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-6 text-xs focus:outline-none focus:border-cyan-500/50 w-72 transition-all backdrop-blur-md italic font-bold"
              />
            </div>
          </div>

          {/* GRID OF CARDS */}
          {loading ? (
            <div className="flex items-center justify-center h-64 text-cyan-500 font-black italic animate-pulse tracking-widest uppercase">
              Accessing Database...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
              <AnimatePresence>
                {filteredUsers.map((u, index) => (
                  <UserCard 
                    key={u._id} 
                    u={u} 
                    index={index} 
                    onDelete={() => handleDelete(u._id, u.name)} 
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
    
  );
}

const UserCard = ({ u, index, onDelete }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      id={u._id}
      className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl relative overflow-hidden group"
    >
      <div className="relative z-10">
        {/* Profile Image & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/20 shadow-2xl relative">
            {/* Image logic: use multer-stored filename from DB (u.image) or fallback to u.profilePic */}
            { (u.image || u.profilePic) ? (
               (() => {
                 const imgVal = u.image || u.profilePic;
                 let src = null;
                 if (typeof imgVal === 'string') {
                   if (imgVal.startsWith('http')) src = imgVal;
                   else if (imgVal.startsWith('/')) src = `${API}${imgVal}`;
                   else src = `${API}/uploads/${imgVal}`;
                 }
                 return <img src={src} alt="avatar" className="w-full h-full object-cover" />;
               })()
            ) : (
               <div className="w-full h-full bg-slate-800 flex items-center justify-center text-cyan-500 font-black text-xl italic uppercase">
                 {u.name?.charAt(0)}
               </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter truncate">{u.name}</h3>
            <div className="flex items-center gap-2">
               <span className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                 {u.role || "Standard"}
               </span>
               {u.role === 'admin' && <ShieldCheck size={12} className="text-cyan-500" />}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3 mb-6">
          <DetailRow icon={Mail} value={u.email} label="Email" />
          <DetailRow icon={Phone} value={u.phone || u.phoneNumber || u.phoneNo || u.mobile || "Not Connected"} label="Phone" />
          <DetailRow icon={UserIcon} value={u.gender || "Not Specified"} label="Gender" />
        </div>

        {/* Bio Box */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-6">
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Node Biography</p>
          <p className="text-[10px] text-slate-400 italic leading-relaxed">
            {u.bio || "No data available in this node's bio field."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => {/* Edit Logic Here */}}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-white transition-all py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest"
          >
            <Edit3 size={12} className="text-cyan-500" /> Edit Node
          </button>
          <button 
            onClick={onDelete}
            className="w-12 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-500 hover:text-white transition-all py-2.5 rounded-xl"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-500"><Icon size={12}/></div>
    <div className="overflow-hidden">
      <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter leading-none mb-1">{label}</p>
      <p className="text-[10px] text-slate-300 font-bold truncate">{value}</p>
    </div>
  </div>
);

export default AllUsers;