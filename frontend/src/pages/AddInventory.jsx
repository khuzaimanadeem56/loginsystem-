import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Image as ImageIcon, X, Edit, Trash2, Minus } from "lucide-react";

function AddInventory() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sale, setSale] = useState("");
  const [discount, setDiscount] = useState("");
  const [inStock, setInStock] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState({});
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const API = "http://localhost:5000";

  useEffect(() => {
    fetch(`${API}/inventory`)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!imageFile) return setPreview(null);
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`${API}/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("sale", sale);
    fd.append("discount", discount || "0");
    fd.append("inStock", inStock ? "true" : "false");
    if (imageFile) fd.append("image", imageFile);

    try {
      const url = editingId ? `${API}/inventory/${editingId}` : `${API}/inventory`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error("Server returned " + res.status);
      const created = await res.json();
      // Ensure discount is preserved if backend doesn't return it
      created.discount = created.discount || discount || "0";
      if (editingId) {
        setItems((s) => s.map((it) => (it._id === created._id ? created : it)));
      } else {
        setItems((s) => [created, ...s]);
      }
      setShowModal(false);
      setName("");
      setDescription("");
      setSale("");
      setDiscount("");
      setEditingId(null);
      removeImage();
      setInStock(true);
      setMessage({ type: "success", text: "Inventory saved" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const isAdmin = user?.email === "khuzi56@gmail.com";

  const startEdit = (it) => {
    setEditingId(it._id);
    setName(it.name || "");
    setDescription(it.description || "");
    setSale(it.sale || "");
    setDiscount(it.discount || "");
    setInStock(Boolean(it.inStock));
    setPreview(it.image ? `${API}${it.image}` : null);
    setShowModal(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-white">
      <div className="h-full border-r border-gray-800 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
           <motion.h2 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black tracking-tighter text-white uppercase italic"
              >
                Inventry  <span className="text-cyan-500">Control</span>
                <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic italic">Manage products and pricing (PKR)</p>
              
              </motion.h2>

            {isAdmin && (
              <button
                onClick={() => { setEditingId(null); setName(""); setDescription(""); setSale(""); setPreview(null); setShowModal(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20 uppercase text-xs tracking-widest"
              >
                <Plus size={18} /> Add New Item
              </button>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative">
                <div className="flex items-start justify-between mb-8">
                  <h3 className="text-2xl font-bold text-cyan-500 uppercase tracking-widest">
                    {editingId ? 'Edit Product' : 'Create Product'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-full h-64 bg-[#030712] border border-gray-800 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                      {preview ? (
                        <img src={preview} alt="preview" className="object-cover h-full w-full" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-600">
                          <ImageIcon size={48} />
                          <span className="mt-2 text-xs">No Preview</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 w-full flex flex-col gap-3">
                      <label htmlFor="imageInput" className="w-full text-center px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl cursor-pointer font-bold text-xs uppercase tracking-tighter">
                        {preview ? 'Change Image' : 'Select Image'}
                      </label>
                      <input id="imageInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-cyan-500 font-bold ml-1">Product Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#030712] border border-gray-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-cyan-500 font-bold ml-1">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#030712] border border-gray-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none resize-none" rows={3} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-cyan-500 font-bold ml-1">Price (PKR)</label>
                      <input type="number" value={sale} onChange={(e) => setSale(e.target.value)} className="w-full bg-[#030712] border border-gray-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none placeholder:text-gray-700" placeholder="e.g. 1500" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-cyan-500 font-bold ml-1">Discount (%)</label>
                      <input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-[#030712] border border-gray-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none placeholder:text-gray-700" placeholder="e.g. 10" />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <button type="button" onClick={() => setInStock(true)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${inStock ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-500"}`}>In Stock</button>
                      <button type="button" onClick={() => setInStock(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${!inStock ? "bg-rose-600 text-white" : "bg-gray-800 text-gray-500"}`}>Out of Stock</button>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold uppercase text-xs">Cancel</button>
                      <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-xs">
                        {saving ? 'Processing...' : (editingId ? 'Update Item' : 'Create Item')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
            {items.map((it) => (
              <div key={it._id} className="group bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-cyan-900/10 transition-all flex flex-col">
                  <div className="relative h-56 bg-[#030712] overflow-hidden">
                  {it.image ? (
                    <img src={`${API}${it.image}`} alt={it.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-700 font-bold uppercase">No Image</div>
                  )}
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

                        <div className="absolute top-4 right-4 bg-cyan-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase flex flex-col items-end">
                          <span className="text-sm">Rs. {d > 0 ? discounted : s}</span>
                          {d > 0 && <span className="text-[12px] text-white/60 line-through mt-0">Rs. {s}</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{it.name}</h3>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 min-h-[32px]">{it.description}</p>

                  <div className="mt-auto flex gap-2">
                    {isAdmin ? (
                      <>
                        <button onClick={() => startEdit(it)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 border border-gray-700">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(it._id)} className="flex-1 py-3 bg-rose-900/20 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 border border-rose-900/30 transition-all">
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    ) : (
                      <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
export default AddInventory;