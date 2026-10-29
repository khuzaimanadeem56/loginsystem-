import { useState, useEffect, useRef } from "react";
import { Mail, MessageCircle, HelpCircle, Send, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL as API } from "../config/api";

function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user')) || { email: 'guest', name: 'Guest' };
  const pollRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/help/messages?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data || []);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    if (chatOpen) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chatOpen]);

  const send = async () => {
    if (!text.trim()) return;
    const payload = { userEmail: user.email || 'guest', userName: user.name || 'Guest', message: text.trim(), from: 'user' };
    try {
      const res = await fetch(`${API}/help/message`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('send failed');
      const j = await res.json();
      setMessages(prev => [...prev, j.msg]);
      setText('');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-[9999] font-sans">
      
      {/* PERFECT CIRCLE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0d1117] text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-center border border-white/10 group relative cursor-pointer"
        aria-label="Support Help"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                <X size={20} className="text-slate-400" />
            </motion.div>
          ) : (
            <motion.div key="help" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                <HelpCircle size={22} className="text-cyan-500 shadow-cyan-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* COMPACT PROFESSIONAL DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.92, transformOrigin: 'bottom right' }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 15, scale: 0.92 }} 
            className="absolute bottom-16 sm:bottom-20 right-0 w-60 bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          >
            <div className="flex flex-col gap-2">
              <div className="px-2 mb-2">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Support Hub</p>
              </div>
              
              <CompactLink 
                icon={<Mail size={16} />} 
                label="Direct Email" 
                href="mailto:khuzi56@gmail.com"
                color="text-cyan-400" 
              />
              
              <button 
                onClick={() => { setOpen(false); setChatOpen(true); }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity"><MessageCircle size={16}/></span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Help</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <div className="pt-2 border-t border-white/5 mt-1 flex justify-between items-center px-2">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Protocol</span>
                <span className="text-[8px] font-mono text-cyan-500/80">KX-v2.5</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT MODAL - Fully responsive on mobile */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 30 }} 
            className="fixed bottom-16 sm:bottom-24 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-80 md:w-[24rem] h-[28rem] sm:h-[30rem] max-h-[85vh] bg-[#020617] border border-white/10 rounded-3xl sm:rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden z-[10000] shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="p-4 sm:p-5 bg-[#0d1117] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center">
                  <HelpCircle size={18} className="text-cyan-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-white uppercase tracking-widest">Support</span>
                  <span className="block text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">System Online</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full cursor-pointer"><X size={16}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <HelpCircle size={40} />
                </div>
              ) : messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.from === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12px] font-medium leading-relaxed ${
                    m.from === 'admin' ? 'bg-[#161b22] text-slate-300 border border-white/5' : 'bg-cyan-600 text-white'
                  }`}>
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 sm:p-4 bg-[#0d1117] border-t border-white/5">
              <div className="flex gap-2">
                <input 
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Inquiry..." 
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 sm:py-3 text-[11px] text-white focus:outline-none focus:border-cyan-500/30" 
                />
                <button onClick={send} className="bg-cyan-600 w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white hover:bg-cyan-500 transition-colors flex items-center justify-center cursor-pointer">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompactLink({ icon, label, href, color }) {
  return (
    <a 
      href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent transition-all group"
    >
      <div className="flex items-center gap-4">
        <span className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</span>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
      </div>
      <ExternalLink size={10} className="text-slate-700 group-hover:text-slate-400" />
    </a>
  );
}

export default HelpWidget;
