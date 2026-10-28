import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HelpWidget from "../components/HelpWidget";
import { LoadingContext } from '../contexts/LoadingContext';
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, MessageSquare, Zap, Activity, Globe, CloudSun, ListTodo, Gift, Star } from 'lucide-react';

const chartData = [
  { name: 'Jan', value: 40 }, { name: 'Feb', value: 60 }, { name: 'Mar', value: 45 },
  { name: 'Apr', value: 70 }, { name: 'May', value: 90 }, { name: 'Jun', value: 85 },
  { name: 'Jul', value: 110 }, { name: 'Aug', value: 95 }, { name: 'Sep', value: 120 },
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const { setLoading } = useContext(LoadingContext);
  const [isLight, setIsLight] = useState(typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme'));
  
  // Exact Weather State for Multan
  const [weather, setWeather] = useState({ temp: "--", condition: "Syncing...", city: "Multan, PK" });
  
  const [stats, setStats] = useState({
    myOrders: 12,
    activeTickets: 1,
    savedItems: 24,
    totalSpent: 4500,
    loyaltyPoints: 850
  });

  // Fetch Exact Multan Weather & User Data
  useEffect(() => {
    const onTheme = () => setIsLight(document.documentElement.classList.contains('light-theme'));
    window.addEventListener('theme-change', onTheme);
    const observer = new MutationObserver(onTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { window.removeEventListener('theme-change', onTheme); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    if (setLoading) setLoading(false);

    const fetchExactWeather = async () => {
      try {
        // Multan Exact Coordinates: Lat 30.15, Long 71.52
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.1575&longitude=71.5249&current_weather=true");
        const data = await res.json();
        if (data && data.current_weather) {
          const code = data.current_weather.weathercode;
          let desc = "Clear Sky";
          if (code > 0 && code <= 3) desc = "Partly Cloudy";
          else if (code > 45) desc = "Mist/Hazy";
          
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            condition: desc,
            city: "Multan, PK"
          });
        }
      } catch (err) {
        console.error("Weather Error:", err);
      }
    };

    fetchExactWeather();
  }, [setLoading]);

  if (!user) return null;

  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1A1D2B] border-white/5 shadow-xl';

  return (
    <div className={`flex h-screen overflow-hidden ${isLight ? 'bg-[#F8FAFC] text-slate-800' : 'bg-[#0F111A] text-slate-300'} font-sans`}>
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar relative z-10 space-y-6 sm:space-y-8">
          
          {/* HEADER WITH TOP-RIGHT WEATHER */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic"
              >
                Welcome, <span className="text-cyan-500">{user?.name?.split(' ')[0]}</span>
              </motion.h1>
              <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mt-2">
                User Command Station <span className="text-emerald-500 ml-2">● Active</span>
              </p>
            </div>

            {/* LIVE WEATHER WIDGET (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className={`${cardBg} rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto`}
            >
              <div className="text-right">
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none mb-1">{weather.city}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="flex items-center gap-3">
                <CloudSun className={weather.temp < 20 ? "text-cyan-400" : "text-orange-400"} size={24} />
                <div className="flex flex-col">
                   <span className="text-xl font-black text-white leading-none">{weather.temp}°C</span>
                   <span className="text-[7px] font-bold text-slate-600 uppercase mt-1">{weather.condition}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4 MAIN CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard isLight={isLight} title="Orders Placed" value={stats.myOrders} icon={ShoppingBag} color="cyan" trend="Recent" />
            <StatCard isLight={isLight} title="Support Desk" value={stats.activeTickets} icon={MessageSquare} color="purple" trend="1 Active" />
            <StatCard isLight={isLight} title="My Wishlist" value={stats.savedItems} icon={Zap} color="emerald" trend="In Stock" />
            <StatCard isLight={isLight} title="Total Spent" value={stats.totalSpent} icon={Activity} color="blue" trend="PKR" prefix="Rs." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logistics Map */}
            <div className={`lg:col-span-8 ${cardBg} rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 relative overflow-hidden group`}>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Global Logistics Trace</h3>
                <Globe size={18} className="text-cyan-500 animate-pulse" />
              </div>
              <div className="h-[200px] sm:h-[280px] flex items-center justify-center opacity-10">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" className="w-full h-full object-contain invert" alt="Map" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping mb-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 tracking-tighter">Live Tracking Active</p>
              </div>
            </div>

            {/* REWARDS & LOYALTY CARD (Right Column) */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`${isLight ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-gray-200 text-slate-800' : 'bg-gradient-to-br from-[#1A1D2B] to-[#11131f] border-white/5 text-white'} border rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl h-[220px]`}>
                <Gift className="absolute -right-4 -bottom-4 text-cyan-500/10 group-hover:scale-110 transition-transform" size={120} />
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500"><Star size={20} fill="currentColor" /></div>
                    <span className="text-[8px] font-black bg-cyan-500 text-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-[0_0_15px_rgba(6,182,212,0.4)]">Gold Tier</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Points</p>
                  <h4 className="text-4xl font-black text-white italic tracking-tighter mt-1">{stats.loyaltyPoints}</h4>
                </div>
                <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Claim Monthly Reward</button>
              </div>

              {/* Progress to Next Tier */}
              <div className={`${cardBg} rounded-[2.5rem] p-6`}>
                <div className="flex justify-between items-end mb-3">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">Next Tier Progress</p>
                  <p className="text-[10px] font-black text-white italic leading-none">85%</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-cyan-600 to-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION - Purchase Analytics & Task Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
            <div className={`lg:col-span-8 ${cardBg} rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8`}>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Shopping Activity Analytics</h3>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="userGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F111A', border: 'none', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fill="url(#userGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className={`lg:col-span-4 ${cardBg} rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8`}>
               <h3 className={`text-[10px] font-black ${isLight ? 'text-slate-600' : 'text-slate-500'} uppercase tracking-[0.3em] mb-6 flex items-center gap-2`}><ListTodo size={14} /> My Action Items</h3>
               <div className="space-y-4">
                  <ReminderItem isLight={isLight} label="Complete Profile Verification" time="Security" color="bg-rose-500" />
                  <ReminderItem isLight={isLight} label="Claim Weekend Discount" time="Promo" color="bg-emerald-500" />
                  <ReminderItem isLight={isLight} label="Leave Product Reviews" time="Reward" color="bg-cyan-500" />
               </div>
            </div>
          </div>

        </main>
        <HelpWidget />
      </div>
    </div>
  );
}

// Sub-components
const StatCard = ({ isLight, title, value, icon: Icon, color, trend, prefix="" }) => {
  const themes = {
    cyan: isLight ? "text-cyan-600 bg-cyan-50 border-cyan-200" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    purple: isLight ? "text-purple-600 bg-purple-50 border-purple-200" : "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: isLight ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: isLight ? "text-blue-600 bg-blue-50 border-blue-200" : "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };
  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1A1D2B] border-white/5 shadow-xl';
  return (
    <motion.div whileHover={{ y: -5 }} className={`${cardBg} p-6 rounded-[2rem] transition-all`}>
      <div className={`p-3 rounded-2xl inline-flex mb-4 border ${themes[color]}`}><Icon size={20} /></div>
      <p className={`text-[9px] font-black ${isLight ? 'text-slate-600' : 'text-slate-500'} uppercase tracking-widest italic mb-1`}>{title}</p>
      <div className="flex justify-between items-end">
        <h3 className={`text-3xl font-black ${isLight ? 'text-slate-800' : 'text-white'} tracking-tighter italic`}>{prefix}{value.toLocaleString()}</h3>
        <span className={`text-[9px] font-black ${isLight ? 'text-slate-500' : 'text-slate-600'} uppercase tracking-tighter`}>{trend}</span>
      </div>
    </motion.div>
  );
};

const ReminderItem = ({ isLight, label, time, color }) => (
  <div className={`flex items-center justify-between group cursor-pointer ${isLight ? 'border-slate-200' : 'border-white/5'} border-b pb-3 last:border-0`}>
    <div className="flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-300 group-hover:bg-cyan-500' : 'bg-slate-700 group-hover:bg-cyan-500'} transition-colors`} />
      <p className={`text-[11px] font-bold ${isLight ? 'text-slate-600 group-hover:text-slate-800' : 'text-slate-400 group-hover:text-white'} transition-all`}>{label}</p>
    </div>
    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-tighter ${color}`}>{time}</span>
  </div>
);

export default Dashboard;