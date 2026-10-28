import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const API = "http://localhost:5000";
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`${API}/orders`)
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  const updateStatus = (id, newStatus) => {
    fetch(`${API}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error);
  };

  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic"
            >
              Order <span className="text-cyan-500">Management</span>
              <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic">Verify Payments & Manage Shipments</p>
            </motion.h2>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                placeholder="Search by TID or Name..." 
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl sm:rounded-[2rem] overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-gray-800">
                  <th className="px-5 py-4">Customer / Product</th>
                  <th className="px-5 py-4">Transaction Details</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {orders.filter(o => o.transactionId?.includes(search) || o.userName?.toLowerCase().includes(search.toLowerCase())).map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white text-sm">{order.userName}</p>
                      <p className="text-xs text-cyan-500 font-medium">{order.productName} (x{order.quantity})</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">{order.transactionId}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase">{order.paymentMethod}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[150px]">{order.address}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-white text-sm">RS. {order.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${
                        order.status === "Approved" ? "border-emerald-500/30 text-emerald-500" : 
                        order.status === "Cancelled" ? "border-rose-500/30 text-rose-500" : "border-amber-500/30 text-amber-500"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
export default AdminOrders;
