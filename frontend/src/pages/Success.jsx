import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import { CheckCircle2, Download, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(state || {});
  const [loading, setLoading] = useState(false);

  // If redirected from Stripe we may have session_id in query params
  useEffect(() => {
    if (payload.items && payload.items.length) return; // already have data
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      // fetch session summary from backend
      (async () => {
        try {
          setLoading(true);
          console.log('[Success] session_id detected:', sessionId);
          // Try relative first (works if proxy configured), otherwise try backend host
          const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const tried = [];
          let res;
          try {
            const relUrl = `/stripe/session/${encodeURIComponent(sessionId)}`;
            tried.push(relUrl);
            res = await fetch(relUrl);
            if (!res.ok) {
              res = null;
            }
          } catch (e) {
            console.warn('[Success] relative fetch failed', e);
            res = null;
          }

          if (!res) {
            try {
              const abs = `${backendBase}/stripe/session/${encodeURIComponent(sessionId)}`;
              tried.push(abs);
              res = await fetch(abs);
            } catch (e) {
              console.warn('[Success] backend fetch failed', e);
              res = null;
            }
          }

          console.log('[Success] fetch attempts:', tried, 'response ok?', !!res && res.ok);
          if (!res || !res.ok) {
            throw new Error('Session fetch failed');
          }

          const serverPayload = await res.json();
          console.log('[Success] server payload received:', serverPayload);
          setPayload(serverPayload);
          // Try to mark pending orders Approved for local testing (if webhook not configured)
          (async () => {
            try {
              const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
              const triedMark = [];
              let markRes = null;
              try {
                const relMark = `/stripe/debug/mark-approved/${encodeURIComponent(sessionId)}`;
                triedMark.push(relMark);
                markRes = await fetch(relMark, { method: 'POST' });
                if (!markRes.ok) markRes = null;
              } catch (e) { markRes = null; }
              if (!markRes) {
                try {
                  const absMark = `${backendBase}/stripe/debug/mark-approved/${encodeURIComponent(sessionId)}`;
                  triedMark.push(absMark);
                  markRes = await fetch(absMark, { method: 'POST' });
                } catch (e) { markRes = null; }
              }
              console.log('[Success] mark-approved attempts:', triedMark, 'ok?', !!markRes && markRes.ok);
            } catch (e) {
              console.warn('[Success] mark-approved failed', e);
            }
          })();
          try { localStorage.removeItem('pending_checkout'); } catch {}
        } catch (err) {
          console.error('Failed to load stripe session', err);
          // Fallback: try pending_checkout from localStorage
          try {
            const pending = JSON.parse(localStorage.getItem('pending_checkout') || 'null');
            console.log('[Success] pending_checkout fallback:', pending);
            if (pending && pending.items) {
              setPayload(pending);
              try { localStorage.removeItem('pending_checkout'); } catch {}
            }
          } catch (e) {
            console.warn('[Success] pending_checkout parse failed', e);
          }
        } finally { setLoading(false); }
      })();
      return;
    }

    // fallback: read pending_checkout saved before Stripe redirect
    try {
      const pending = JSON.parse(localStorage.getItem('pending_checkout') || 'null');
      if (pending && pending.items) {
        setPayload(pending);
        localStorage.removeItem('pending_checkout');
      }
    } catch (err) { /* ignore */ }
  }, [payload]);

  const generatePDF = () => {
    try {
      if (!payload.items || payload.items.length === 0) {
        alert("No items found to generate receipt.");
        return;
      }

      const doc = new jsPDF();
      
      // --- HEADER ---
      doc.setFillColor(15, 23, 42); // Dark Blue / Black
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("KHUZI XCESSORIES", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Official Digital Receipt", 20, 33);

      // --- INFO ---
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER INFORMATION", 20, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 65);
      doc.text(`Transaction ID: ${payload.transactionId || 'N/A'}`, 20, 72);
      doc.text(`Payment: ${String(payload.paymentMethod).toUpperCase() || 'N/A'}`, 20, 79);

      // --- TABLE HEADER ---
      let y = 95;
      doc.setFillColor(6, 182, 212); // Cyan Color
      doc.rect(20, y, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Product Name", 25, y + 5.5);
      doc.text("Qty", 120, y + 5.5);
      doc.text("Price", 145, y + 5.5);
      doc.text("Total", 175, y + 5.5);

      // --- TABLE ROWS ---
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      y += 15;

      payload.items.forEach((item, index) => {
        const itemPrice = Number(item.sale || item.price || 0);
        const itemQty = Number(item.quantity || 1);
        const itemTotal = itemPrice * itemQty;

        doc.text(String(item.name).substring(0, 35), 25, y); // Long names cut off
        doc.text(String(itemQty), 122, y);
        doc.text(itemPrice.toLocaleString(), 145, y);
        doc.text(itemTotal.toLocaleString(), 175, y);
        
        // Line under each row
        doc.setDrawColor(240, 240, 240);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;

        // If page ends, add new (optional for short receipts)
        if (y > 270) { doc.addPage(); y = 20; }
      });

      // --- GRAND TOTAL ---
      y += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212); // Cyan
      doc.text(`GRAND TOTAL: RS. ${Number(payload.total).toLocaleString()}`, 120, y + 10);

      // --- FOOTER ---
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for shopping! Keep this receipt for your records.", 105, 285, { align: "center" });

      // SAVE
      doc.save(`Receipt-${payload.transactionId?.slice(-6) || 'Order'}.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712] text-gray-400">Loading...</div>
  );

  if (!payload.items) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#030712] text-gray-500">
      <ShieldCheck size={40} className="mb-4 opacity-20" />
      <p className="font-bold tracking-widest text-xs">SESSION EXPIRED</p>
      <button onClick={() => navigate('/')} className="mt-6 text-cyan-500 font-black text-sm">RETURN TO STORE</button>
    </div>
  );

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] p-4 overflow-hidden relative font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full shadow-2xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full shadow-2xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0f172a]/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />

        <div className="flex justify-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter italic">PAID SUCCESSFULLY</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Order process complete</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center shadow-inner">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Amount</span>
            <span className="text-white font-black text-lg">RS. {Number(payload.total || 0).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 shadow-inner">
              <span className="block text-gray-600 text-[9px] font-bold uppercase mb-1 tracking-widest">Method</span>
              <span className="text-gray-300 text-xs font-bold uppercase truncate block">{payload.paymentMethod || 'N/A'}</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 shadow-inner">
              <span className="block text-gray-600 text-[9px] font-bold uppercase mb-1 tracking-widest">Order ID</span>
              <span className="text-cyan-500 text-xs font-mono font-bold truncate block">#{payload.transactionId?.slice(-8) || '0000'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/products')} 
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-xl"
          >
            CONTINUE SHOPPING <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={generatePDF} 
            className="w-full py-4 bg-gray-800/40 hover:bg-gray-800/60 text-gray-400 hover:text-white rounded-2xl font-bold text-[10px] tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
          >
            <Download size={14} /> SAVE RECEIPT (PDF)
          </button>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 opacity-30 grayscale pointer-events-none">
            <div className="h-4 w-4 bg-white/20 rounded-full" />
            <span className="text-[9px] font-bold text-white tracking-[0.2em]">SECURE TRANSACTION GATEWAY</span>
        </div>
      </motion.div>
    </div>
  );
}

export default Success;