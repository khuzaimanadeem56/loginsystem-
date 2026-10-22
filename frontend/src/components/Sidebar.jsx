import {
  Home,
  User,
  Users,
  Star,
  MessageCircle,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  PlusSquare,
  FileText
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from 'react';
import { LoadingContext } from '../contexts/LoadingContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "khuzi56@gmail.com";

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-cyan-600/20 text-cyan-400 border-r-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      : "text-slate-400 hover:bg-white/5 hover:text-white";

  const { setLoading } = useContext(LoadingContext);

  const go = (path) => {
    try { setLoading(true); } catch (e) {}
    navigate(path);
  };

  return (
    <div className="w-60 bg-[#020617] border-r border-white/5 h-screen flex flex-col font-sans transition-all">

      {/* BRANDING SECTION - Updated with KX and Full Name */}
      <div className="p-5 mb-2">
        <div className="flex items-center gap-3">
          {/* KX Logo Icon */}
          <div className="w-9 h-9 bg-cyan-600 rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter text-sm">
            KX
          </div>
          <div>
            <h1 className="text-[11px] font-black text-white tracking-widest uppercase italic leading-none">
              Khuzi <span className="text-cyan-500">Xcessories</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-tighter mt-1 uppercase">
              {isAdmin ? "Admin Console" : "User Portal"}
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <ul className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 ml-2 mt-4 italic">Navigation</p>

        {/* DASHBOARD */}
        <li
          onClick={() => go(isAdmin ? "/admin/dashboard" : "/dashboard")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(isAdmin ? "/admin/dashboard" : "/dashboard")}`}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </li>

        {/* ADMIN SECTIONS */}
        {isAdmin && (
          <>
            <li
              onClick={() => go("/inventory")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/inventory")}`}
            >
              <PlusSquare size={18} />
              <span>Add Inventory</span>
            </li>
            <li
              onClick={() => go("/admin/users")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/admin/users")}`}
            >
              <Users size={18} />
              <span>All Users</span>
            </li>
            <li
              onClick={() => go("/admin/reviews")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/admin/reviews")}`}
            >
              <Star size={18} />
              <span>All Reviews</span>
            </li>
            <li
              onClick={() => go("/admin/orders")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/admin/orders")}`}
            >
              <ShoppingBag size={18} />
              <span>Manage Orders</span>
            </li>
            <li
              onClick={() => go("/admin/help")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/admin/help")}`}
            >
              <MessageCircle size={18} />
              <span>Help Chats</span>
            </li>
          </>
        )}

        {/* USER SECTIONS */}
        {!isAdmin && (
          <>
            <li
              onClick={() => go("/products")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/products")}`}
            >
              <ShoppingBag size={18} />
              <span>Marketplace</span>
            </li>
            
              <li
              onClick={() => go("/cart")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/cart")}`}
            >
              <ShoppingCart size={18} />
              <span>My Cart</span>
            </li>

            <li
              onClick={() => go("/order-history")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/order-history")}`}
            >
              <FileText size={18} />
              <span>Billing</span>
            </li>
            <li
              onClick={() => navigate("/reviews")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/reviews")}`}
            >
              <Star size={18} />
              <span>My Reviews</span>
            </li>
          </>
        )}

        {/* PROFILE */}
        <li
          onClick={() => go("/profile")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive("/profile")}`}
        >
          <User size={18} />
          <span>Account</span>
        </li>
      </ul>

      {/* ADMIN STATUS INDICATOR */}
      {isAdmin && (
        <div className="px-5 py-2">
           <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-cyan-500" />
              <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Root Access</span>
           </div>
        </div>
      )}

      {/* LOGOUT */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all py-2.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;