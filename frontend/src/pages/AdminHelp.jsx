import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function AdminHelp(){
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const API = 'http://localhost:5000';
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.email === 'khuzi56@gmail.com';

  useEffect(() => { fetchThreads(); }, []);

  const fetchThreads = async ()=>{
    try{
      const res = await fetch(`${API}/help/threads`);
      const data = await res.json();
      setThreads(data);
    }catch(e){console.error(e)}
  }

  const openThread = async (email)=>{
    setSelected(email);
    try{
      const res = await fetch(`${API}/help/thread/${encodeURIComponent(email)}`);
      const data = await res.json();
      setMessages(data);
    }catch(e){console.error(e)}
  }

  const sendReply = async ()=>{
    if(!reply.trim() || !selected) return;
    try{
      const payload = { userEmail: selected, userName: 'Admin', message: reply.trim(), from: 'admin' };
      const res = await fetch(`${API}/help/message`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const j = await res.json();
      setMessages(prev => [...prev, j.msg]);
      setReply('');
    }catch(e){console.error(e)}
  }

  if(!isAdmin) return <div className="h-screen flex items-center justify-center">Unauthorized</div>

  return (
    <div className="flex h-screen bg-[#030712] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <main className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 bg-[#0f172a] p-4 rounded-2xl border border-white/5">
              <h3 className="font-black mb-4">Conversations</h3>
              <div className="space-y-2">
                {threads.map(t => (
                  <div key={t._id} onClick={()=>openThread(t._id)} className="p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                    <div className="font-bold">{t._id}</div>
                    <div className="text-xs text-gray-400">{t.lastMessage?.message?.slice(0,60)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-3 bg-[#0f172a] p-4 rounded-2xl border border-white/5 flex flex-col">
              <h3 className="font-black mb-4">{selected || 'Select a conversation'}</h3>
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.map(m => (
                  <div key={m._id} className={`p-3 rounded-lg ${m.from==='admin' ? 'bg-emerald-600/10 ml-auto' : 'bg-white/5'}`}>
                    <div className="text-xs text-gray-400">{m.userName} • {new Date(m.createdAt).toLocaleString()}</div>
                    <div className="mt-1">{m.message}</div>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="mt-4 flex gap-2">
                  <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type reply..." className="flex-1 px-4 py-2 rounded-2xl bg-black/40 border border-white/5 outline-none" />
                  <button onClick={sendReply} className="bg-cyan-600 px-6 rounded-2xl font-bold">Send</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminHelp;
