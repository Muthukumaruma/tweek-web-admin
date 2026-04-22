import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DashboardPage({ auth, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', role: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const headers = { Authorization: `Bearer ${auth.token}` };

  useEffect(() => {
    axios.get(`${auth.apiBase}/api/sessions`, { headers }).then(({ data }) => setSessions(data));
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await axios.post(`${auth.apiBase}/api/sessions`, form, { headers });
    setSessions((p) => [data, ...p]);
    setForm({ title: '', company: '', role: '' });
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    await axios.delete(`${auth.apiBase}/api/sessions/${id}`, { headers });
    setSessions((p) => p.filter((s) => s._id !== id));
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <nav style={s.sidebar}>
        <h2 style={s.logo}>Interview AI</h2>
        <p style={s.userEmail}>{auth.user?.email}</p>
        <div style={s.navLinks}>
          <span style={s.navActive}>📋 Sessions</span>
          <Link to="/training" style={s.navLink}>⚡ Training</Link>
          <Link to="/docs" style={s.navLink}>📖 Docs</Link>
        </div>
        <button style={s.logoutBtn} onClick={onLogout}>Logout</button>
      </nav>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topBar}>
          <h1 style={s.heading}>Interview Sessions</h1>
          <span style={s.badge}>{sessions.length} total</span>
        </div>

        {/* New session form */}
        <form onSubmit={createSession} style={s.newForm}>
          <input style={s.input} placeholder="Session title *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input style={s.input} placeholder="Company" value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input style={s.input} placeholder="Role" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <button style={s.createBtn} type="submit" disabled={loading}>
            {loading ? '...' : '+ New Session'}
          </button>
        </form>

        {/* Sessions grid */}
        <div style={s.grid}>
          {sessions.map((session) => (
            <div key={session._id} style={s.card}>
              <div style={s.cardHeader}>
                <Link to={`/session/${session._id}`} style={s.cardTitle}>{session.title}</Link>
                <span style={{ ...s.statusBadge, background: session.status === 'active' ? '#16a34a' : '#475569' }}>
                  {session.status}
                </span>
              </div>
              {session.company && <p style={s.cardMeta}>{session.company} · {session.role}</p>}
              <p style={s.cardDate}>{new Date(session.startedAt).toLocaleDateString()}</p>
              <p style={s.cardMessages}>{session.transcript?.length || 0} messages</p>
              <div style={s.cardActions}>
                <Link to={`/session/${session._id}`} style={s.viewBtn}>View Transcript</Link>
                <button style={s.deleteBtn} onClick={() => deleteSession(session._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1e1e2e', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid #334155', flexShrink: 0 },
  logo: { color: '#a78bfa', fontSize: 18, fontWeight: 800 },
  userEmail: { color: '#64748b', fontSize: 12, marginTop: -8 },
  navLinks: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navActive: { color: '#e2e8f0', padding: '8px 12px', background: 'rgba(124,58,237,0.2)', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  navLink: { color: '#94a3b8', padding: '8px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', display: 'block' },
  logoutBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  topBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  heading: { color: '#e2e8f0', fontSize: 24, fontWeight: 700 },
  badge: { background: 'rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: 20, padding: '3px 10px', fontSize: 12 },
  newForm: { display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' },
  input: { padding: '10px 14px', background: '#1e1e2e', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', flex: 1, minWidth: 140 },
  createBtn: { padding: '10px 20px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#1e1e2e', borderRadius: 12, padding: 18, border: '1px solid #334155' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: 15, textDecoration: 'none' },
  statusBadge: { borderRadius: 4, padding: '2px 8px', color: '#fff', fontSize: 11, flexShrink: 0 },
  cardMeta: { color: '#94a3b8', fontSize: 13 },
  cardDate: { color: '#475569', fontSize: 12, marginTop: 4 },
  cardMessages: { color: '#64748b', fontSize: 12 },
  cardActions: { display: 'flex', gap: 8, marginTop: 12 },
  viewBtn: { flex: 1, textAlign: 'center', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', borderRadius: 6, padding: '6px 10px', fontSize: 12, textDecoration: 'none', cursor: 'pointer' },
  deleteBtn: { background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' },
};
