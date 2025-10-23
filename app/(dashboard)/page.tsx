export const dynamic = 'force-dynamic'; // don't try to prerender at build
// or: export const revalidate = 0;

'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(setTickets).catch(() => setTickets([]));
  }, []);

  async function createTicket() {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, priority: 'MEDIUM' }),
    });
    if (res.ok) {
      const item = await res.json();
      setTickets([item, ...tickets]);
      setTitle(''); setDesc('');
    } else {
      alert('Failed to create ticket');
    }
  }

  return (
    <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 12}}>Ops360 — Dashboard</h1>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24}}>
        <div style={{border: '1px solid #eee', borderRadius: 12, padding: 16}}>
          <div>Open</div>
          <div style={{fontSize: 24, fontWeight: 700}}>{tickets.filter(t => t.status === 'OPEN').length}</div>
        </div>
        <div style={{border: '1px solid #eee', borderRadius: 12, padding: 16}}>
          <div>In Progress</div>
          <div style={{fontSize: 24, fontWeight: 700}}>{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
        </div>
        <div style={{border: '1px solid #eee', borderRadius: 12, padding: 16}}>
          <div>Resolved</div>
          <div style={{fontSize: 24, fontWeight: 700}}>{tickets.filter(t => t.status === 'RESOLVED').length}</div>
        </div>
      </div>

      <div style={{border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 24}}>
        <h2 style={{fontWeight: 600, marginBottom: 8}}>New Ticket</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
        <button onClick={createTicket} style={{padding:'8px 12px', border:'1px solid #ddd', borderRadius:8, cursor:'pointer'}}>Create</button>
      </div>

      <div style={{border: '1px solid #eee', borderRadius: 12, padding: 16}}>
        <h2 style={{fontWeight: 600, marginBottom: 8}}>Recent Tickets</h2>
        <ul style={{display:'grid', gap:8}}>
          {tickets.map(t => (
            <li key={t.id} style={{border:'1px solid #eee', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:600}}>{t.title}</div>
                <div style={{opacity:0.7, fontSize:12}}>{t.description}</div>
              </div>
              <span style={{fontSize:12, border:'1px solid #ddd', padding:'2px 6px', borderRadius: 999}}>{t.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
