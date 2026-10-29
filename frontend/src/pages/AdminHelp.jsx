import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { API_URL as API } from "../config/api";

function AdminHelp() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch(`${API}/help/threads`);
      if (res.ok) setThreads(await res.json());
    } catch (e) { console.error(e); }
  };

  const openThread = async (id) => {
    setSelected(id);
    try {
      const res = await fetch(`${API}/help/thread/${encodeURIComponent(id)}`);
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    try {
      const payload = { userEmail: selected, userName: 'Admin', message: reply.trim(), from: 'admin' };
      const res = await fetch(`${API}/help/message`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (res.ok) {
        const j = await res.json();
        setMessages(p => [...p, j.msg]);
        setReply('');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar user={user} />
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Thread list */}
            <div className="col-span-1 bg-[#0f172a] p-4 rounded-2xl border border-white/5">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-cyan-400">Conversations</h3>
              <div className="space-y-2 max-h-60 md:max-h-[70vh] overflow-y-auto custom-scrollbar">
                {threads.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No inquiries found.</p>
                ) : (
                  threads.map(t => (
                    <div
                      key={t._id}
                      onClick={() => openThread(t._id)}
                      className={`p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border ${
                        selected === t._id ? 'bg-cyan-500/10 border-cyan-500/30' : 'border-transparent'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{t._id}</div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{t.lastMessage?.message?.slice(0, 60)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat conversation */}
            <div className="col-span-1 md:col-span-3 bg-[#0f172a] p-4 rounded-2xl border border-white/5 flex flex-col min-h-[350px] md:min-h-[500px]">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4 truncate text-white border-b border-white/5 pb-3">
                {selected ? `Chat with: ${selected}` : 'Select a conversation from left'}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                    {selected ? 'No messages in this conversation yet.' : 'Click on a user email to view messages.'}
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m._id} className={`p-3 rounded-xl max-w-[85%] ${m.from === 'admin' ? 'bg-cyan-600/20 border border-cyan-500/20 ml-auto' : 'bg-white/5 border border-white/5'}`}>
                      <div className="text-[10px] text-gray-400 font-semibold">{m.userName} • {new Date(m.createdAt).toLocaleString()}</div>
                      <div className="mt-1 text-xs leading-relaxed text-slate-200">{m.message}</div>
                    </div>
                  ))
                )}
              </div>

              {selected && (
                <div className="mt-4 flex gap-2 pt-2 border-t border-white/5">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendReply()}
                    placeholder="Type reply..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button onClick={sendReply} className="bg-cyan-600 hover:bg-cyan-500 px-5 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer">
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHelp;
