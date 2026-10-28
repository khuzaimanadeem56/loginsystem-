import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowLeft, ShieldCheck, Smartphone, Landmark, X, Copy, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity } = location.state || {};
  
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [address, setAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [tid, setTid] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000";

  const paymentDetails = {
    jazzcash: { title: "JazzCash", account: "03271744162", holder: "Muhamad Khuzaima Nadeem", color: "bg-[#F70000]", icon: <Smartphone size={32} /> },
    easypaisa: { title: "EasyPaisa", account: "03171744162", holder: "Muhammad Khuzaima Nadeem", color: "bg-[#1fb47e]", icon: <Smartphone size={32} /> },
    bank: { title: "Bank Transfer", account: "1632333913233", holder: "Muhammad Khuzaima Nadeem", color: "bg-[#0033a0]", icon: <Landmark size={32} /> }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUserData({ name: savedUser.name || "", email: savedUser.email || "" });
    }
  }, []);

  if (!product) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white italic">Redirecting to store...</div>;

  const shippingFee = 250; // RS. 250 Shipping
  const subtotal = product.sale * quantity;
  const total = subtotal + shippingFee;

  const openPaymentModal = (method) => {
    setSelectedMethod({ ...paymentDetails[method], type: method });
    setShowModal(true);
  };

  // --- SAVE ORDER TO HISTORY ---
  const handleConfirmOrder = async () => {
    if (!tid) return alert("Please enter Transaction ID (TID)");
    if (!address) return alert("Please enter delivery address");

    setLoading(true);
    const orderData = {
      userEmail: userData.email,
      userName: userData.name,
      productName: product.name,
      productId: product._id,
      quantity,
      totalAmount: total,
      paymentMethod: selectedMethod.title,
      transactionId: tid,
      address: address,
      // user already provided TID / confirmed payment — mark as approved
      status: "Approved",
      date: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Order Placed Successfully! It will be verified soon.");
        navigate("/order-history");
      } else {
        alert("Failed to save order. Please try again.");
      }
    } catch (err) {
      console.error("Order Error:", err);
      alert("Server Error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-300 flex flex-col overflow-hidden font-sans">
      
      {/* Navbar */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/40 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold tracking-tighter uppercase text-xs">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
          <ShieldCheck className="text-cyan-400" size={16} />
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Secured PKR Transaction</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a]/60 border border-white/5 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 backdrop-blur-md">
              <h2 className="text-xl font-black text-white mb-6 tracking-tight uppercase">1. Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Full Name</p>
                  <input readOnly value={userData.name} className="w-full bg-[#020617] border border-white/5 rounded-xl px-5 py-3 text-slate-400 outline-none" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Email Address</p>
                  <input readOnly value={userData.email} className="w-full bg-[#020617] border border-white/5 rounded-xl px-5 py-3 text-slate-400 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Delivery Address</p>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-cyan-500" size={18} />
                  <input 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" 
                    placeholder="Enter your complete home address" 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a]/60 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md">
              <h2 className="text-xl font-black text-white mb-6 tracking-tight uppercase">2. Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['jazzcash', 'easypaisa', 'bank'].map((method) => (
                  <button key={method} onClick={() => openPaymentModal(method)} className="group p-5 rounded-2xl border border-white/5 bg-[#020617] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all flex flex-col items-center gap-2">
                    <div className="text-slate-500 group-hover:text-cyan-400 transition-all">{paymentDetails[method].icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{paymentDetails[method].title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side: Summary */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111827] border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl sticky top-6 sm:top-10">
              <h3 className="text-[10px] font-black text-cyan-500 mb-6 uppercase tracking-[0.2em]">Order Summary</h3>
              
              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 mb-6">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                   <img src={`${API}${product.image}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{product.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Qty: {quantity} x RS. {product.sale}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Subtotal</span>
                  <span className="text-white">RS. {subtotal}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Shipping</span>
                  <span className="text-white">RS. {shippingFee}</span>
                </div>
                <div className="pt-6 mt-6 border-t border-white/10">
                  <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Total Amount</p>
                  <div className="flex justify-between items-end">
                    <p className="text-4xl font-black text-white tracking-tighter">RS. {total}</p>
                    <CreditCard className="text-slate-700 mb-1" size={32} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-[360px] bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 shadow-3xl overflow-hidden">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18}/></button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${selectedMethod.color} rounded-lg flex items-center justify-center text-white`}>{selectedMethod.icon}</div>
                <div>
                  <h3 className="text-base font-black text-white uppercase leading-none">{selectedMethod.title}</h3>
                  <p className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest mt-1">RS. {total} Payable</p>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-6 space-y-3">
                <div className="flex justify-between"><p className="text-[9px] text-slate-500 uppercase font-bold">Holder</p><p className="text-[10px] font-bold text-white">{selectedMethod.holder}</p></div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase ml-1">Account Number</p>
                  <div className="flex justify-between items-center bg-[#020617] px-3 py-2 rounded-lg border border-white/5">
                    <span className="text-cyan-400 font-mono text-sm font-bold tracking-widest">{selectedMethod.account}</span>
                    <button onClick={() => {navigator.clipboard.writeText(selectedMethod.account); alert("Copied!")}} className="text-slate-500 hover:text-cyan-400"><Copy size={14}/></button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-center text-white focus:border-cyan-500 outline-none font-bold text-xs tracking-widest placeholder:text-slate-800 uppercase" 
                  placeholder="ENTER TID (e.g. 123456)"
                />
                <button 
                  disabled={loading}
                  onClick={handleConfirmOrder}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${selectedMethod.color} text-white hover:brightness-110 active:scale-95 shadow-xl`}
                >
                  {loading ? "Processing..." : "Confirm My Order"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Checkout;