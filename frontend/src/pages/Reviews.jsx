import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Star, Send, Sparkles, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

function Reviews() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [form, setForm] = useState({ rating: 0, name: "", title: "", comment: "" });

  // Prefill logic (No changes)
  useEffect(() => {
    if (stored?.name) {
      setForm(f => ({ ...f, name: stored.name }));
      return;
    }
    if (stored?._id) {
      fetch(`http://localhost:5000/auth/profile/${stored._id}`)
        .then(r => r.ok ? r.json() : null)
        .then(profile => {
          if (profile && profile.name) {
            setForm(f => ({ ...f, name: profile.name }));
            try {
              const existing = JSON.parse(localStorage.getItem('user') || '{}');
              localStorage.setItem('user', JSON.stringify({ ...existing, name: profile.name }));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.name || !form.title || !form.comment || form.rating === 0) {
      alert("Please fill all fields and select a rating");
      return;
    }

    // Original Backend Logic
    const res = await fetch("http://localhost:5000/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: stored?._id || null,
        name: form.name,
        title: form.title,
        comment: form.comment,
        rating: form.rating,
      }),
    });

    const data = await res.json();
    alert(data.message);
    setForm({ rating: 0, name: "", title: "", comment: "" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-200">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Navbar user={stored} />

        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6 relative z-10 custom-scrollbar">
          
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Branding/Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Community Feedback
              </div>
              <h1 className="text-5xl font-black text-white leading-tight uppercase italic">
                Your Voice <br /> 
                <span className="text-cyan-500 text-6xl">Matters.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                Join our elite circle of customers. Share your experience and help us refine the future of Khuzi Xcessories.
              </p>
              
          
            </motion.div>

            {/* Right Side: The Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10">
                <form onSubmit={submitReview} className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                      <MessageSquare size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Post a Review</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="relative group">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 text-sm font-medium"
                        required
                      />
                    </div>

                    {/* Review Title */}
                    <input
                      type="text"
                      placeholder="Review Headline (e.g. Excellent Product!)"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 text-sm font-medium"
                      required
                    />

                    {/* Comment */}
                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 text-sm font-medium resize-none"
                      rows="3"
                      placeholder="Tell us about your experience..."
                      required
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Rating</span>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          key={star}
                          onClick={() => setForm({ ...form, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`transition-all duration-300 ${
                              form.rating >= star ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-slate-700 hover:text-slate-500"
                            }`}
                            size={28}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs"
                  >
                    <span>Push Review</span>
                    <Send size={16} className="rotate-12" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reviews;