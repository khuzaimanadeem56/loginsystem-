import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaBell, FaCog, FaStar } from "react-icons/fa";
import { Menu } from "lucide-react";

function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark'; } catch { return 'dark'; }
  });
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fetchController = { current: null };
  const debounceRef = { current: null };
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === "khuzi56@gmail.com";

  useEffect(() => {
    // apply theme class to body
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
    try { localStorage.setItem('theme', theme); } catch {}
    try { window.dispatchEvent(new Event('theme-change')); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const prettify = (str) =>
    str
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const getTitleFromPath = (path) => {
    if (!path) return "Dashboard";
    if (path === "/") return "Login";
    if (path === "/register") return "Register";
    if (path === "/dashboard") return "Dashboard";
    if (path === "/profile") return "Profile";
    if (path === "/reviews") return "Reviews";
    if (path === "/products") return "Products";
    if (path === "/inventory") return "Add Inventory";
    if (path.startsWith("/admin/dashboard")) return "Admin Dashboard";
    if (path.startsWith("/admin/users")) return "All Users";
    if (path.startsWith("/admin/reviews")) return "Admin Reviews";
    // fallback: use last segment
    const segs = path.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || "";
    return prettify(last) || "Dashboard";
  };

  const title = getTitleFromPath(location.pathname);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // fuzzy match helper (subsequence match)
  const fuzzyMatch = (text, q) => {
    text = text.toLowerCase();
    q = q.toLowerCase();
    let i = 0, j = 0;
    while (i < text.length && j < q.length) {
      if (text[i] === q[j]) j++;
      i++;
    }
    return j === q.length;
  };

  // build route suggestions
  const getRouteSuggestions = (q) => {
    if (isAdmin) {
      const adminRoutes = [
        { keys: ['dashboard', 'home'], path: '/admin/dashboard', label: 'Admin Dashboard' },
        { keys: ['inventory', 'products', 'items'], path: '/inventory', label: 'Inventory' },
        { keys: ['users', 'all users'], path: '/admin/users', label: 'All Users' },
        { keys: ['orders', 'manage orders'], path: '/admin/orders', label: 'Manage Orders' },
        { keys: ['reviews', 'feedback'], path: '/admin/reviews', label: 'Admin Reviews' },
        { keys: ['settings', 'config'], path: '/settings', label: 'Settings' }
      ];
      const out = [];
      for (const r of adminRoutes) {
        for (const k of r.keys) {
          if (k.includes(q.toLowerCase()) || fuzzyMatch(k, q)) { out.push({ type: 'route', label: r.label, path: r.path }); break; }
        }
      }
      return out;
    }

    const routes = [
      { keys: ['profile', 'account', 'my profile', 'user'], path: '/profile', label: 'Profile' },
      { keys: ['dashboard', 'home'], path: '/dashboard', label: 'Dashboard' },
      { keys: ['cart', 'tray'], path: '/cart', label: 'Cart' },
      { keys: ['orders', 'order', 'billing', 'history'], path: '/order-history', label: 'Orders' },
      { keys: ['reviews', 'my reviews'], path: '/reviews', label: 'Reviews' },
      { keys: ['settings', 'setting'], path: '/settings', label: 'Settings' },
      { keys: ['products', 'market', 'marketplace', 'shop', 'store'], path: `/products?q=${encodeURIComponent(q)}`, label: `Search products for "${q}"` }
    ];
    const res = [];
    for (const r of routes) {
      for (const k of r.keys) {
        if (k.includes(q.toLowerCase()) || fuzzyMatch(k, q)) {
          res.push({ type: 'route', label: r.label, path: r.path });
          break;
        }
      }
    }
    return res;
  };

  // fetch product suggestions
  const fetchProductSuggestions = async (q) => {
    if (!q) return [];
    try {
      if (fetchController.current) fetchController.current.abort();
      fetchController.current = new AbortController();
      const res = await fetch('http://localhost:5000/inventory', { signal: fetchController.current.signal });
      const items = await res.json();
      const filtered = items
        .filter(it => {
          const name = (it.name || '').toString();
          return name.toLowerCase().includes(q.toLowerCase()) || fuzzyMatch(name, q);
        })
        .slice(0, 6)
        .map(it => ({ type: 'product', label: it.name, path: isAdmin ? `/inventory?q=${encodeURIComponent(q)}` : `/products?q=${encodeURIComponent(q)}`, id: it._id }));
      return filtered;
    } catch (err) {
      return [];
    }
  };

  const updateSuggestions = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!q) { setSuggestions([]); setShowSuggestions(false); return; }
      const routeSug = getRouteSuggestions(q);
      const prodSug = await fetchProductSuggestions(q);
      const merged = [...routeSug, ...prodSug];
      setSuggestions(merged);
      setActiveIndex(-1);
      setShowSuggestions(merged.length > 0);
    }, 250);
  };

  const performFallbackSearch = (q) => {
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (sugg) => {
    if (!sugg) return;
    if (sugg.type === 'route') {
      navigate(sugg.path);
    } else if (sugg.type === 'product') {
      navigate(sugg.path);
    }
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleInputKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') performFallbackSearch(searchQuery.trim());
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) handleSelectSuggestion(suggestions[activeIndex]);
      else performFallbackSearch(searchQuery.trim());
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const imageUrl = user?.image
    ? `http://localhost:5000/uploads/${user.image}`
    : null;

  const firstLetter = user?.name?.charAt(0).toUpperCase();

  const navBase = 'px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center relative border-b flex-shrink-0';
  const navClass = theme === 'light'
    ? `${navBase} bg-white text-black border-gray-200`
    : `${navBase} bg-[#0a192f] text-white border-gray-800`;

  const searchBg = theme === 'light' ? 'bg-gray-100 text-black' : 'bg-[#112240] text-sm';

  return (
    <nav className={navClass}>
      {/* LEFT SIDE: Mobile Menu Trigger + Brand / Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="p-2 -ml-1 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 md:hidden transition-colors cursor-pointer"
          aria-label="Toggle Sidebar Navigation"
        >
          <Menu size={19} />
        </button>

        <h2
          className="font-bold text-base sm:text-xl tracking-tight cursor-pointer truncate max-w-[150px] sm:max-w-none"
          onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/dashboard")}
        >
          {title}
        </h2>
      </div>

      {/* RIGHT SIDE: Search, Theme Toggle, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Search Bar - hidden on small mobile, visible from md up */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search name, data, or page..."
            className={`${searchBg} rounded-full py-1.5 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-56 lg:w-64 transition-all`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); updateSuggestions(e.target.value); }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-500" size={13} />

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute mt-2 left-0 w-80 bg-[#0b1724] text-white rounded-xl shadow-2xl overflow-hidden z-50 border border-white/10">
              <ul>
                {suggestions.map((s, idx) => (
                  <li
                    key={`${s.type}-${s.label}-${idx}`}
                    onMouseDown={(ev) => { ev.preventDefault(); handleSelectSuggestion(s); }}
                    className={`px-4 py-2 cursor-pointer hover:bg-white/5 ${idx === activeIndex ? 'bg-white/5' : ''}`}
                  >
                    <div className="text-sm font-bold">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.type === 'route' ? 'Page' : 'Product'}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <div
          onClick={toggleTheme}
          title="Toggle theme"
          className="flex items-center rounded-full px-1.5 py-1 gap-1 cursor-pointer"
        >
          <div className={theme === 'light' ? 'bg-black rounded-full p-1' : 'bg-white rounded-full p-1'}>
            <FaStar className={theme === 'light' ? 'text-white preserve-white text-[10px]' : 'text-[#00bcd4] text-[10px]'} />
          </div>
        </div>

        {/* Notification Icon */}
        <button className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Notifications">
          <FaBell size={16} />
        </button>

        {/* Settings Icon - hidden on very small screens to maintain breathing space */}
        <button className="text-gray-400 hover:text-white transition-colors p-1 hidden sm:block" aria-label="Settings">
          <FaCog size={16} />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative flex items-center cursor-pointer ml-1" onClick={() => setOpen(!open)}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="profile"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-cyan-500"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
              {firstLetter}
            </div>
          )}
          
          {/* Dropdown Menu */}
          {open && (
            (() => {
              const dropdownClass = theme === 'light'
                ? 'absolute right-0 top-11 bg-white text-black rounded-xl shadow-2xl w-44 overflow-hidden border border-gray-200 z-50'
                : 'absolute right-0 top-11 bg-[#112240] text-white rounded-xl shadow-2xl w-44 overflow-hidden border border-gray-700 z-50';
              const headerClass = theme === 'light' ? 'p-3 border-b border-gray-200 text-xs text-gray-600' : 'p-3 border-b border-gray-700 text-xs text-gray-400';
              const liHover = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-[#1d3557]';
              const logoutClass = theme === 'light' ? 'p-3 hover:bg-red-50 cursor-pointer text-red-600 border-t border-gray-200' : 'p-3 hover:bg-red-900/30 cursor-pointer text-red-400 border-t border-gray-700';
              return (
                <div className={dropdownClass}>
                  <div className={headerClass}>
                    Logged in as: <br/><span className={theme === 'light' ? 'text-black font-semibold truncate block' : 'text-white font-semibold truncate block'}>{user?.name}</span>
                  </div>
                  <ul className="text-sm">
                    <li onClick={() => navigate("/profile")} className={`p-3 ${liHover} cursor-pointer`}>Profile</li>
                    <li onClick={logout} className={logoutClass}>Logout</li>
                  </ul>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
