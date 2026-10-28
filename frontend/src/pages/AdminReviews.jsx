import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, UserCircle, MessageSquareQuote, Loader2 } from "lucide-react";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // 👈 Loading state add ki
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.email !== "khuzi56@gmail.com") {
      window.location.href = "/dashboard";
      return;
    }
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true); // Fetch shuru hone se pehle loading true
      const res = await fetch("http://localhost:5000/reviews");
      const data = await res.json();
      
      const userIds = [...new Set(data.map((r) => r.userId).filter(Boolean))];
      const usersMap = {};
      
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const uRes = await fetch(`http://localhost:5000/auth/profile/${id}`);
            if (!uRes.ok) return;
            const u = await uRes.json();
            usersMap[id] = u;
          } catch (e) { /* ignore */ }
        })
      );

      const merged = data.map((r) => ({
        ...r,
        userImage: r.userId && usersMap[r.userId] ? `http://localhost:5000/uploads/${usersMap[r.userId].image}` : null,
        userName: r.name || (r.userId && usersMap[r.userId] ? usersMap[r.userId].name : "User"),
      }));

      setReviews(merged);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false); // Data milne ke baad loading false
    }
  };

  const deleteReview = async (id) => {
    const ok = window.confirm("Delete this review?");
    if (!ok) return;
    await fetch(`http://localhost:5000/reviews/${id}`, { method: "DELETE" });
    setReviews(reviews.filter((r) => r._id !== id));
  };

  return (
    // 'scroll-smooth' class add ki gayi hai smooth scrolling ke liye
    <div className="flex h-screen overflow-hidden bg-[#030712] text-white scroll-smooth">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />

        {/* 'scroll-behavior: smooth' aur 'will-change-transform' performance behtar karte hain */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar" style={{ scrollBehavior: 'smooth', willChange: 'transform' }}>
          
          <div className="mb-8">
      <motion.h1 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black tracking-tighter text-white uppercase italic"
              >
                User <span className="text-cyan-500">Feedback</span>
                <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic">Manage and moderate all reviews in a compact view.</p>
              </motion.h1>
          </div>

          {/* Logic: Pehle Loader check hoga, phir Data */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="text-yellow-500 animate-spin mb-2" size={40} />
              <p className="text-gray-500 text-xs uppercase tracking-widest">Loading Reviews...</p>
            </div>
          ) : (
            <>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg hover:border-gray-700 transition-all flex flex-col relative group h-full"
                    >
                      {/* ... baki sara card code wahi hai ... */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {r.userImage ? (
                            <img src={r.userImage} alt={r.userName} className="w-9 h-9 rounded-full object-cover border-2 border-transparent" />
                          ) : (
                            <UserCircle size={36} className="text-gray-600" />
                          )}
                          <div>
                            <p className="font-bold text-sm text-white truncate w-32">{r.userName}</p>
                            <p className="text-[9px] uppercase font-bold text-cyan-500">Verified</p>
                          </div>
                        </div>
                        <button onClick={() => deleteReview(r._id)} className="p-1.5 bg-rose-900/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= r.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-700"} />
                        ))}
                      </div>

                      <div className="flex-1">
                        <h2 className="text-base font-bold mb-2 line-clamp-1">{r.title}</h2>
                        <p className="text-gray-400 text-xs italic line-clamp-3">"{r.comment}"</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-end">
                         <span className="text-[9px] text-gray-600 font-mono uppercase">Verified Feedback</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800 rounded-2xl">
                   <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">No reviews found</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminReviews;