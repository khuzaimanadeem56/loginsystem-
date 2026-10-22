import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ShoppingBag, Clock, CheckCircle2, XCircle, Receipt, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

 function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = "http://localhost:5000";
  
  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (user?.email) {
      fetch(`${API}/orders?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          // Show all orders (including pending) so Stripe-created orders are visible to the user.
          // Status will still display as Pending until webhook marks them Approved.
          setOrders((data || []).sort((a,b) => new Date(b.date) - new Date(a.date)));
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user?.email]);

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    const successVariants = ["success", "approved", "succeeded", "paid", "complete", "completed"];
    if (successVariants.includes(s)) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === "pending") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (s === "cancelled" || s === "canceled") return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-white">
      <div className="h-full border-r border-gray-800 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
           <motion.h2 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black tracking-tighter text-white uppercase italic"
              >
                My Order <span className="text-cyan-500">History</span>
                <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic">Track your purchases and billing status</p>
              </motion.h2>
            </header>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-[#111827] rounded-[2rem] border border-gray-800">
                <Receipt size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No orders found yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    key={order._id} 
                    className="bg-[#111827] border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      {/* Product Info */}
                      <div className="flex items-center gap-4 min-w-[250px]">
                        <div className="w-16 h-16 bg-[#030712] rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden">
                          {/* Yahan aap product image bhi dikha sakte hain agar API se aa rahi ho */}
                          <ShoppingBag className="text-gray-700" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{order.productName}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            Qty: {order.quantity} | {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Transaction ID */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Transaction ID</span>
                        <span className="text-xs font-mono text-cyan-500 font-bold">{order.transactionId}</span>
                      </div>

                      {/* Payment Method */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Method</span>
                        <span className="text-xs font-bold text-gray-300">{order.paymentMethod}</span>
                      </div>

                      {/* Total Amount */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Total Paid</span>
                        <span className="text-lg font-black text-white">RS. {order.totalAmount}</span>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(order.status)}`}>
                        {(function(){
                          const s = (order.status || "").toLowerCase();
                          const successVariants = ["success", "approved", "succeeded", "paid", "complete", "completed"];
                          if (successVariants.includes(s)) return (<><CheckCircle2 size={12} />Approved</>);
                          if (s === "pending") return (<><Clock size={12} />Pending</>);
                          if (s === "cancelled" || s === "canceled") return (<><XCircle size={12} />Cancelled</>);
                          return order.status;
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default OrderHistory;