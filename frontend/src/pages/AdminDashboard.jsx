import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Users, Package, ShoppingBag, MessageSquare, Activity, Globe, CheckCircle2, ListTodo, CloudSun, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LoadingContext } from '../contexts/LoadingContext';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { setLoading } = useContext(LoadingContext);
  const [isLight, setIsLight] = useState(typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme'));

  // --- UPDATED: Multan Weather State with Real Initial Logic ---
  const [weather, setWeather] = useState({ temp: "--", condition: "Syncing...", city: "Multan, PK" });

  useEffect(() => {
    const onTheme = () => setIsLight(document.documentElement.classList.contains('light-theme'));
    window.addEventListener('theme-change', onTheme);
    const observer = new MutationObserver(onTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { window.removeEventListener('theme-change', onTheme); observer.disconnect(); };
  }, []);
  
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalFeedback: 0 });

  const monthlySalesData = [
    { name: 'Jan', sales: 110 }, { name: 'Feb', sales: 130 }, { name: 'Mar', sales: 150 },
    { name: 'Apr', sales: 160 }, { name: 'May', sales: 190 }, { name: 'Jun', sales: 210 },
    { name: 'Jul', sales: 230 }, { name: 'Aug', sales: 260 }, { name: 'Sep', sales: 290 },
    { name: 'Oct', sales: 270 }, { name: 'Nov', sales: 250 }, { name: 'Dec', sales: 230 },
  ];

  useEffect(() => {
    (async () => {
      try {
        if (typeof setLoading === 'function') setLoading(true);
        
        // --- FETCHING STATS & WEATHER IN PARALLEL ---
        const [u, p, o, r, w] = await Promise.all([
          fetch("http://localhost:5000/auth/users"),
          fetch("http://localhost:5000/inventory"),
          fetch("http://localhost:5000/orders/admin/all"),
          fetch("http://localhost:5000/reviews"),
          // Accurate Open-Meteo for Multan Lat/Long
          fetch("https://api.open-meteo.com/v1/forecast?latitude=30.1575&longitude=71.5249&current_weather=true")
        ]);

        const [users, products, orders, reviews, weatherData] = await Promise.all([
          u.json(), p.json(), o.json(), r.json(), w.json()
        ]);

        setStats({
          totalUsers: users.length || 0,
          totalProducts: products.length || 0,
          totalOrders: orders.length || 0,
          totalFeedback: reviews.length || 0
        });

        // Update Weather State
        if (weatherData && weatherData.current_weather) {
          const code = weatherData.current_weather.weathercode;
          let desc = "Clear Sky";
          if (code > 0 && code <= 3) desc = "Partly Cloudy";
          else if (code > 45) desc = "Haze/Mist";
          else if (code > 60) desc = "Rainy";

          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            condition: desc,
            city: "Multan, PK"
          });
        }

      } catch (e) { console.error(e); }
      finally { if (typeof setLoading === 'function') setLoading(false); }
    })();
  }, [setLoading]);

  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1A1D2B] border-white/5 shadow-xl';

  return (
    <div className={`flex h-screen overflow-hidden ${isLight ? 'bg-[#F8FAFC]' : 'bg-[#0F111A] text-slate-300'} font-sans`}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-6">
          
          {/* 1. TOP 4 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard isLight={isLight} label="Total Users" targetValue={stats.totalUsers} change="+10%" icon={Users} color="text-emerald-500" />
            <StatsCard isLight={isLight} label="Our Products" targetValue={stats.totalProducts} change="-7%" icon={Package} color="text-rose-500" />
            <StatsCard isLight={isLight} label="Unique Oders" targetValue={stats.totalOrders} change="-12%" icon={Globe} color="text-cyan-500" />
            <StatsCard isLight={isLight} label="Bounce Rate" targetValue={33} suffix="%" change="33%" icon={Activity} color="text-orange-500" />
          </div>

          {/* 2. MAP & PROGRESS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`lg:col-span-2 ${cardBg} border rounded-3xl p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Site Visits / Global</h3>
                <TrendingUp size={16} className="text-cyan-500" />
              </div>
              <div className="relative h-[320px] flex items-center justify-center opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
                     className={`w-full h-full object-contain ${isLight ? '' : 'invert'}`} alt="World Map" />
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              </div>
            </motion.div>

            <div className="flex flex-col gap-6">
              <div className={`${cardBg} border rounded-3xl p-6 space-y-6`}>
                <RegionProgress label="UAE Visitors" value={50} color="bg-purple-500" count="100k" />
                <RegionProgress label="Europe Visitors" value={80} color="bg-emerald-500" count="1M" />
                <RegionProgress label="Australia Visitors" value={40} color="bg-cyan-500" count="450k" />
                <RegionProgress label="Pakistan Visitors" value={90} color="bg-slate-500" count="1B" />
              </div>
              <div className={`${cardBg} border rounded-3xl p-6 grid grid-cols-3 gap-2`}>
                <CircularStat value={75} label="Users" color="#f43f5e" />
                <CircularStat value={50} label="Sales" color="#06b6d4" />
                <CircularStat value={90} label="Bounce" color="#f59e0b" />
              </div>
            </div>
          </div>

          {/* 3. CHART & TODO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${cardBg} border rounded-3xl p-6`}>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monthly Stats</h3>
                  <div className="flex gap-6">
                    <span className="text-[10px] font-bold text-emerald-500">54% Sales Growth</span>
                    <span className="text-[10px] font-bold text-cyan-500">60% Profit Growth</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white italic tracking-tighter">$185K <span className="text-[10px] text-slate-500 uppercase not-italic">Dec Sales</span></p>
                </div>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} />
                    <YAxis axisLine={false} tickLine={false} fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`${cardBg} border rounded-3xl p-6`}>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ListTodo size={14}/> Todo List</h3>
                <div className="space-y-3">
                  <TodoItem label="Call John for Dinner" time="2 Days" color="bg-emerald-500" />
                  <TodoItem label="Book Boss Flight" time="3 Mins" color="bg-rose-500" />
                  <TodoItem label="Hit the Gym" time="Tomorrow" color="bg-orange-500" />
                  <TodoItem label="Give Purchase Report" time="Done" color="bg-cyan-500" />
                </div>
              </div>

              {/* UPDATED WEATHER SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`${cardBg} border rounded-[2rem] p-5 flex flex-col justify-between overflow-hidden relative group`}>
                  <CloudSun className={`${weather.temp > 28 ? 'text-orange-500' : 'text-cyan-400'} transition-colors`} size={24} />
                  <div className="relative z-10">
                    <p className="text-2xl font-black tracking-tighter text-white">{weather.temp}°C</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-cyan-500">{weather.city}</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase">{weather.condition}</p>
                  </div>
                  {/* Subtle Background Glow */}
                  <div className={`absolute -right-2 -bottom-2 w-12 h-12 ${weather.temp > 28 ? 'bg-orange-500/10' : 'bg-cyan-500/10'} blur-xl rounded-full`} />
                </div>
                <div className="bg-blue-600 rounded-[2rem] p-5 text-white flex flex-col justify-between shadow-lg shadow-blue-900/20">
                   <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Sales Report</p>
                   <div>
                      <p className="text-2xl font-black italic tracking-tighter">$6,000</p>
                      <p className="text-[8px] font-bold uppercase opacity-60">Nov 2026</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS --- (Ye sab bilkul sahi thay apkay code mein)
const StatsCard = ({ isLight, label, targetValue, change, icon: Icon, color, suffix="" }) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-[#1A1D2B] border-white/5 shadow-xl'}`}>
    <div className="flex justify-between items-center mb-4">
      <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${color}`}><Icon size={18} /></div>
      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{change}</div>
    </div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
    <h3 className="text-2xl font-black tracking-tighter italic text-white">
        <Countdown target={targetValue} />{suffix}
    </h3>
    <div className="mt-4 flex gap-1">
        {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-cyan-500/40' : 'bg-white/5'}`} />)}
    </div>
  </div>
);

const RegionProgress = ({ label, value, color, count }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-end">
            <p className="text-[9px] font-bold text-slate-500 uppercase">{label}</p>
            <p className="text-[10px] font-black text-white">{count}</p>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5 }} className={`h-full ${color}`} />
        </div>
    </div>
);

const CircularStat = ({ value, label, color }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                <circle cx="22" cy="22" r="18" stroke={color} strokeWidth="3" fill="transparent" strokeDasharray={113} strokeDashoffset={113 - (113 * value) / 100} className="transition-all duration-1000" />
            </svg>
            <span className="absolute text-[8px] font-black">{value}%</span>
        </div>
        <span className="text-[7px] font-black text-slate-500 uppercase text-center">{label}</span>
    </div>
);

const TodoItem = ({ label, time, color }) => (
    <div className="flex items-center justify-between group cursor-pointer border-b border-white/[0.03] pb-2 last:border-0">
        <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full border border-white/10 group-hover:border-cyan-500 transition-colors" />
            <p className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-all">{label}</p>
        </div>
        <span className={`text-[7px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-tighter ${color}`}>{time}</span>
    </div>
);

function Countdown({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const startValue = 0;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(startValue + progress * (target - startValue));
      setCount(currentValue);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target]);
  return <>{count.toLocaleString()}</>;
}

export default AdminDashboard;