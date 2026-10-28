import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Search, ShoppingCart, Minus, Plus, Tag } from "lucide-react";
import { motion } from "framer-motion";

function Products() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({});
  const API = "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/inventory`)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  const user = JSON.parse(localStorage.getItem("user")) || null;

  const handleBuyNow = (product) => {
    const selectedQty = qty[product._id] || 1;
    // Add to cart stored in localStorage
    const existing = JSON.parse(localStorage.getItem("cart")) || [];
    const foundIndex = existing.findIndex(i => i._id === product._id);
    if (foundIndex >= 0) {
      existing[foundIndex].quantity = (existing[foundIndex].quantity || 0) + selectedQty;
    } else {
      existing.push({ ...product, quantity: selectedQty });
    }
    localStorage.setItem("cart", JSON.stringify(existing));
    navigate("/cart");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      
      {/* Sidebar - Fixed */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 sm:mb-10 gap-4">
          <motion.h2 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic"
              >
                
                Market <span className="text-cyan-500">Place</span>
                
                <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic">Premium Products in PKR</p>
              </motion.h2>

            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full bg-[#111827] border border-gray-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600 shadow-2xl"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 pb-10">
            {items
              .filter((it) => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (
                  (it.name || "").toLowerCase().includes(q) ||
                  (it.description || "").toLowerCase().includes(q)
                );
              })
              .map((it) => (
                <motion.div 
                  key={it._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  className="group bg-[#111827] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl hover:border-cyan-500/30 transition-all flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-56 bg-[#030712] overflow-hidden">
                    {it.image ? (
                      <img 
                        src={`${API}${it.image}`} 
                        alt={it.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-700 font-bold uppercase tracking-widest text-[10px]">Image Unavailable</div>
                    )}
                    
                    {/* Price Badge - CHANGED TO RS. */}
                    {(() => {
                      const s = Number(it.sale) || 0;
                      const d = Number(it.discount) || 0;
                      const discounted = Math.round(s * (1 - d / 100));
                      return (
                        <>
                          {d > 0 && (
                            <div className="absolute top-4 left-4 bg-rose-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-md uppercase">
                              -{d}% OFF
                            </div>
                          )}

                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl flex flex-col items-end">
                            <div className="text-sm">RS. {d > 0 ? discounted : s}</div>
                            {d > 0 && <div className="text-[12px] text-white/60 line-through mt-0">RS. {s}</div>}
                          </div>
                        </>
                      );
                    })()}

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#111827] to-transparent">
                       <div className="flex items-center gap-1.5 bg-[#111827]/80 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-white/5">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${it.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${it.inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {it.inStock ? 'Available Now' : 'Out of Stock'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-cyan-400 transition-colors">{it.name}</h3>
                    {/* Sirf ye hissa replace karein description ke liye */}
<div className="h-8 mb-4 overflow-hidden">
  <p className="text-gray-500 text-[11px] leading-tight font-medium line-clamp-2">
    {it.description}
  </p>
</div>

                    <div className="mt-auto space-y-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between bg-[#030712] rounded-xl border border-white/5 p-1.5">
                        <button 
                          onClick={() => setQty(q => ({ ...q, [it._id]: Math.max(1, (q[it._id] || 1) - 1) }))} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-white text-xs tracking-widest">
                          {String(qty[it._id] || 1).padStart(2, '0')}
                        </span>
                        <button 
                          onClick={() => setQty(q => ({ ...q, [it._id]: (q[it._id] || 1) + 1 }))} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => handleBuyNow(it)} 
                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-2xl ${
                          it.inStock 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40' 
                          : 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        disabled={!it.inStock}
                      >
                        <ShoppingCart size={14} />
                        {it.inStock ? 'Buy Now' : 'Waitlist Only'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products;