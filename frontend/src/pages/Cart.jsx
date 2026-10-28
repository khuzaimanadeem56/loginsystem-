import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ShoppingCart, CreditCard, X, Trash2, Plus, Minus, MapPin, CheckCircle2, Wallet } from "lucide-react";

function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState(null);
  const [tid, setTid] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = "http://localhost:5000";

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(c);
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setAddress(savedUser.address || "");
  }, []);

  const saveCart = (c) => {
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  };

  const updateQty = (id, q) => {
    const next = cart.map(i => i._id === id ? { ...i, quantity: q } : i);
    saveCart(next);
  };

  const removeItem = (id) => {
    const next = cart.filter(i => i._id !== id);
    saveCart(next);
  };

  const shippingFee = 250;
  const subtotal = cart.reduce((s, it) => s + (Number(it.sale || it.price || 0) * (it.quantity || 1)), 0);
  const total = subtotal + (cart.length ? shippingFee : 0);

  const openPayment = () => {
    if (!cart.length) return alert("Cart is empty");
    if (!address) return alert("Enter delivery address");
    setShowModal(true);
  };

  const generateTid = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  const processPayment = async (selected) => {
    setLoading(true);
    const transactionId = selected === 'jazzcash' || selected === 'easypaisa' ? tid || generateTid() : generateTid();
    try {
      for (let idx = 0; idx < cart.length; idx++) {
        const it = cart[idx];
        const orderData = {
          userEmail: JSON.parse(localStorage.getItem('user'))?.email || 'guest',
          userName: JSON.parse(localStorage.getItem('user'))?.name || 'Guest',
          productName: it.name,
          productId: it._id,
          quantity: it.quantity || 1,
          totalAmount: (Number(it.sale || it.price || 0) * (it.quantity || 1)) + (idx === 0 ? shippingFee : 0),
          paymentMethod: selected,
          transactionId,
          address,
          // user confirmed payment (entered TID) — treat as Approved
          status: 'Approved',
          date: new Date().toISOString()
        };

        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!res.ok) throw new Error('Order save failed');
      }

      localStorage.removeItem('cart');
      setCart([]);
      setShowModal(false);
      navigate('/success', { state: { items: cart, total, transactionId, paymentMethod: selected, address } });
    } catch (err) {
      console.error(err);
      navigate('/cancel');
    } finally {
      setLoading(false);
    }
  };

  const createStripeSession = async () => {
    if (!cart.length) return alert('Cart is empty');
    try {
      const res = await fetch(`${API}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          success_url: window.location.origin + '/success',
          cancel_url: window.location.origin + '/cancel',
          email: JSON.parse(localStorage.getItem('user'))?.email,
          name: JSON.parse(localStorage.getItem('user'))?.name,
          address
        })
      });

      let payload;
      try { payload = await res.json(); } catch (e) { payload = null; }
      if (!res.ok) {
        const msg = (payload && payload.error) ? payload.error : `Server returned ${res.status}`;
        alert('Failed to create Stripe session: ' + msg);
        return;
      }

      if (payload && payload.url) {
        // store pending checkout so Success page can show if Stripe doesn't append session_id
        try { localStorage.setItem('pending_checkout', JSON.stringify({ items: cart, total, paymentMethod: 'Stripe' })); } catch {}
        window.location = payload.url;
      }
    } catch (err) {
      alert('Stripe error');
    }
  };

  const paymentMethods = [
    { id: 'stripe', name: 'Stripe Checkout', icon: <CreditCard className="text-blue-400" />, desc: 'Pay via Card/Link' },
    { id: 'jazzcash', name: 'JazzCash', icon: <Wallet className="text-red-500" />, desc: 'Mobile Wallet' },
    { id: 'easypaisa', name: 'EasyPaisa', icon: <Wallet className="text-green-500" />, desc: 'Mobile Wallet' },
    { id: 'card', name: 'Direct Card', icon: <CreditCard className="text-indigo-400" />, desc: 'Manual Entry' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-200">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={JSON.parse(localStorage.getItem('user'))} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-cyan-500/10 rounded-2xl">
                <ShoppingCart className="text-cyan-400" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">My Cart</h2>
                <p className="text-gray-500 text-sm font-medium">{cart.length} Premium items in your tray</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.length === 0 ? (
                  <div className="bg-[#111827]/50 border border-dashed border-gray-800 rounded-[2rem] p-12 text-center">
                    <p className="text-gray-500 italic">Your cart is empty. Time to fill it with some gear!</p>
                  </div>
                ) : (
                  cart.map((it) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={it._id} 
                      className="bg-[#111827] border border-gray-800/50 rounded-2xl sm:rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group hover:border-gray-700 transition-all"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/5 bg-black">
                        <img src={`${API}${it.image}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate">{it.name}</h3>
                        <p className="text-cyan-400 font-mono text-sm">RS. {it.sale || it.price}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button onClick={() => updateQty(it._id, Math.max(1, (it.quantity || 1) - 1))} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><Minus size={16}/></button>
                            <span className="w-8 text-center font-bold text-white text-sm">{it.quantity || 1}</span>
                            <button onClick={() => updateQty(it._id, (it.quantity || 1) + 1)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><Plus size={16}/></button>
                          </div>
                          <button onClick={() => removeItem(it._id)} className="text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                            <Trash2 size={14}/> Remove
                          </button>
                        </div>
                      </div>

                      <div className="text-right sm:block w-full sm:w-auto flex justify-between items-center sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <span className="text-xs text-gray-500 sm:hidden">Item Total:</span>
                        <div className="text-white font-black text-lg sm:text-xl">RS. {(Number(it.sale || it.price || 0) * (it.quantity || 1)).toLocaleString()}</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Order Summary Sidebar */}
              {cart.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-6 sticky top-8">
                    <h3 className="text-white font-black text-xl mb-6 flex items-center gap-2">Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-400 text-sm font-medium">
                        <span>Subtotal</span>
                        <span className="text-white">RS. {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-sm font-medium">
                        <span>Shipping Fee</span>
                        <span className="text-white font-mono">+ RS. {shippingFee}</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-4" />
                      <div className="flex justify-between items-end">
                        <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Grand Total</span>
                        <span className="text-2xl font-black text-cyan-400 tracking-tighter">RS. {total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" size={18} />
                        <input 
                          value={address} 
                          onChange={e => setAddress(e.target.value)} 
                          placeholder="Delivery Address" 
                          className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm outline-none focus:border-cyan-500/50 transition-all" 
                        />
                      </div>
                      <button 
                        onClick={openPayment} 
                        className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black shadow-lg shadow-cyan-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        CHECKOUT NOW <CheckCircle2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modern Payment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0f172a] border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />
              
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <X size={24}/>
              </button>

              <h3 className="text-2xl font-black text-white mb-2">Secure Checkout</h3>
              <p className="text-gray-500 text-sm mb-8">Select your preferred payment method to proceed.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {paymentMethods.map((pm) => (
                  <button 
                    key={pm.id}
                    onClick={() => pm.id === 'stripe' ? createStripeSession() : setMethod(pm.id)} 
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${
                      method === pm.id 
                      ? 'bg-cyan-500/10 border-cyan-500' 
                      : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="p-3 bg-gray-900 rounded-xl">{pm.icon}</div>
                    <div>
                      <div className="text-white font-bold text-sm">{pm.name}</div>
                      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{pm.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Forms */}
              <AnimatePresence mode="wait">
                {method === 'card' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                    <input placeholder="Card Number" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-500/50" />
                    <div className="flex gap-4">
                      <input placeholder="MM/YY" className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-500/50" />
                      <input placeholder="CVV" className="w-32 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-500/50" />
                    </div>
                    <button disabled={loading} onClick={() => processPayment('card')} className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-emerald-900/20">
                      {loading ? 'Authorizing...' : 'Finalize Payment'}
                    </button>
                  </motion.div>
                )}

                {(method === 'jazzcash' || method === 'easypaisa') && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl mb-4">
                      <div className="text-yellow-500"><Wallet size={24}/></div>
                      <p className="text-xs text-gray-400">Please send RS. {total.toLocaleString()} to <strong>0300-1234567</strong> and enter the Transaction ID below.</p>
                    </div>
                    <input value={tid} onChange={e => setTid(e.target.value)} placeholder="Enter 12-digit TID" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-500/50" />
                    <button disabled={loading} onClick={() => processPayment(method)} className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm transition-all">
                      {loading ? 'Verifying...' : 'Confirm Order'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;