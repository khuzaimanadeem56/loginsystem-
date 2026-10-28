import { useState, useEffect, useContext } from "react";
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
  FileText,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingContext } from '../contexts/LoadingContext';

function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "khuzi56@gmail.com";
  const { setLoading } = useContext(LoadingContext);

  // Listen for mobile sidebar toggle from Navbar
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);

    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    setIsMobileOpen(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-cyan-600/20 text-cyan-400 border-r-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      : "text-slate-400 hover:bg-white/5 hover:text-white";

  const go = (path) => {
    setIsMobileOpen(false);
    try {
      if (setLoading) setLoading(true);
    } catch (e) {}
    navigate(path);
  };

  // Reusable Nav Content
  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* BRANDING SECTION */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-600 rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter text-sm shadow-md shadow-cyan-600/30">
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

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* MENU ITEMS */}
      <ul className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-3">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 ml-2 mt-2 italic">
          Navigation
        </p>

        {/* DASHBOARD */}
        <li
          onClick={() => go(isAdmin ? "/admin/dashboard" : "/dashboard")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
            isAdmin ? "/admin/dashboard" : "/dashboard"
          )}`}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </li>

        {/* ADMIN SECTIONS */}
        {isAdmin && (
          <>
            <li
              onClick={() => go("/inventory")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/inventory"
              )}`}
            >
              <PlusSquare size={18} />
              <span>Add Inventory</span>
            </li>
            <li
              onClick={() => go("/admin/users")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/admin/users"
              )}`}
            >
              <Users size={18} />
              <span>All Users</span>
            </li>
            <li
              onClick={() => go("/admin/reviews")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/admin/reviews"
              )}`}
            >
              <Star size={18} />
              <span>All Reviews</span>
            </li>
            <li
              onClick={() => go("/admin/orders")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/admin/orders"
              )}`}
            >
              <ShoppingBag size={18} />
              <span>Manage Orders</span>
            </li>
            <li
              onClick={() => go("/admin/help")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/admin/help"
              )}`}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/products"
              )}`}
            >
              <ShoppingBag size={18} />
              <span>Marketplace</span>
            </li>

            <li
              onClick={() => go("/cart")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/cart"
              )}`}
            >
              <ShoppingCart size={18} />
              <span>My Cart</span>
            </li>

            <li
              onClick={() => go("/order-history")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/order-history"
              )}`}
            >
              <FileText size={18} />
              <span>Billing</span>
            </li>
            <li
              onClick={() => go("/reviews")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
                "/reviews"
              )}`}
            >
              <Star size={18} />
              <span>My Reviews</span>
            </li>
          </>
        )}

        {/* PROFILE */}
        <li
          onClick={() => go("/profile")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-xs font-bold uppercase tracking-tight ${isActive(
            "/profile"
          )}`}
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
            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">
              Root Access
            </span>
          </div>
        </div>
      )}

      {/* LOGOUT */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all py-2.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:flex w-60 bg-[#020617] border-r border-white/5 h-screen flex-col font-sans transition-all flex-shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* 2. MOBILE SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[999] md:hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Slide-in Drawer Container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full bg-[#020617] border-r border-white/10 shadow-2xl flex flex-col font-sans"
            >
              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
