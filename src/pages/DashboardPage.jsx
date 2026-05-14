import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LOGISTICS = [
  /share (your|my|the) screen/i,
  /sharing (my|the|your)?\s*screen/i,
  /i('m| am) sharing/i,
  /i (have |'ve )?shared/i,
  /open (that|the|this) link/i,
  /click (that|the|this) link/i,
  /can you (hear|see) me/i,
  /your (audio|video|camera|mic|sound)/i,
  /turn on (your|the) (camera|mic|audio|video)/i,
  /can you (just |please )?open/i,
  /unmute|mute yourself|can you see (my|the)/i,
];

function isActualQuestion(text) {
  const t = (text || '').trim();
  if (t.split(/\s+/).length < 5 || t.length < 20) return false;
  if (LOGISTICS.some((p) => p.test(t))) return false;
  return /\b(what|where|when|who|why|how|explain|describe|tell me|implement|design|write|code|difference|compare|example|your experience|background|approach|solve|optimize|debug|refactor|build|create|find|define|walk me through|have you|did you|would you|could you|can you)\b/i.test(t);
}

export default function DashboardPage({ auth, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
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

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this session and all its transcript data?')) return;
    await axios.delete(`${auth.apiBase}/api/sessions/${id}`, { headers });
    setSessions((p) => p.filter((s) => s._id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

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

        {/* Sessions list */}
        <div style={s.list}>
          {sessions.length === 0 && (
            <div style={s.empty}>No sessions yet — create one above to get started.</div>
          )}
          {sessions.map((session) => {
            const questions = (session.transcript || [])
              .filter((m) => m.role === 'interviewer' && !m.isScreenshot && isActualQuestion(m.content))
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const isOpen = expandedId === session._id;
            return (
              <div key={session._id} style={s.card}>
                {/* Card header row */}
                <div style={s.cardHeader}>
                  <div style={s.cardLeft}>
                    <Link to={`/session/${session._id}`} style={s.cardTitle}>{session.title}</Link>
                    {session.company && (
                      <span style={s.cardMeta}>{session.company}{session.role ? ` · ${session.role}` : ''}</span>
                    )}
                    <span style={s.cardDate}>{new Date(session.startedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={s.cardRight}>
                    <span style={{ ...s.statusBadge, background: session.status === 'active' ? '#16a34a' : '#475569' }}>
                      {session.status}
                    </span>
                    <button
                      style={{ ...s.qBtn, background: isOpen ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.08)', borderColor: isOpen ? '#a78bfa' : 'rgba(124,58,237,0.3)' }}
                      onClick={() => toggleExpand(session._id)}
                      title="Show / hide questions"
                    >
                      ❓ {questions.length} Q{questions.length !== 1 ? 's' : ''}
                    </button>
                    <Link to={`/session/${session._id}`} style={s.viewBtn}>View</Link>
                    <button style={s.deleteBtn} onClick={(e) => deleteSession(session._id, e)}>🗑 Delete</button>
                  </div>
                </div>

                {/* Expandable questions list */}
                {isOpen && (
                  <div style={s.qList}>
                    {questions.length === 0 ? (
                      <div style={s.qEmpty}>No questions recorded in this session.</div>
                    ) : (
                      questions.map((q, i) => (
                        <div key={i} style={s.qRow}>
                          <span style={s.qNum}>{i + 1}</span>
                          <span style={s.qText}>{q.content}</span>
                          <button
                            style={s.copyBtn}
                            onClick={() => navigator.clipboard.writeText(q.content).catch(() => {})}
                            title="Copy question"
                          >⎘</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a14' },
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
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { color: '#475569', fontSize: 14, textAlign: 'center', padding: '40px 0' },
  card: { background: '#1e1e2e', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', gap: 12, flexWrap: 'wrap' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 0 },
  cardTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' },
  cardMeta: { color: '#94a3b8', fontSize: 13 },
  cardDate: { color: '#475569', fontSize: 12 },
  cardRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  statusBadge: { borderRadius: 4, padding: '2px 8px', color: '#fff', fontSize: 11 },
  qBtn: { border: '1px solid', borderRadius: 6, padding: '4px 10px', color: '#a78bfa', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  viewBtn: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', borderRadius: 6, padding: '5px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 600 },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  qList: { borderTop: '1px solid #334155', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.2)' },
  qEmpty: { color: '#475569', fontSize: 13, textAlign: 'center', padding: '8px 0' },
  qRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' },
  qNum: { color: '#7c3aed', fontWeight: 800, fontSize: 12, minWidth: 20, marginTop: 1 },
  qText: { color: '#e2e8f0', fontSize: 13, flex: 1, lineHeight: 1.5 },
  copyBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#64748b', fontSize: 12, cursor: 'pointer', padding: '1px 6px', flexShrink: 0 },
};
