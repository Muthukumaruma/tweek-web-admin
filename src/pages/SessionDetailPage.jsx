import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

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

export default function SessionDetailPage({ auth }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [question, setQuestion] = useState('');
  const [socket, setSocket] = useState(null);
  const [tab, setTab] = useState('transcript'); // 'transcript' | 'questions'
  const [copied, setCopied] = useState(null);
  const scrollRef = useRef(null);

  const headers = { Authorization: `Bearer ${auth.token}` };

  useEffect(() => {
    axios.get(`${auth.apiBase}/api/sessions/${id}`, { headers }).then(({ data }) => setSession(data));

    const s = io(auth.apiBase, { auth: { token: auth.token }, transports: ['websocket'] });
    s.on('connect', () => s.emit('join_session', { sessionId: id }));
    s.on('ai_answer_start', () => { setStreaming(true); setAnswer(''); });
    s.on('ai_answer_chunk', ({ chunk }) => {
      setAnswer((p) => p + chunk);
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    });
    s.on('ai_answer_done', ({ answer: full }) => {
      setAnswer(full);
      setStreaming(false);
      // refresh transcript
      axios.get(`${auth.apiBase}/api/sessions/${id}`, { headers }).then(({ data }) => setSession(data));
    });
    s.on('question_received', ({ question: q }) => setQuestion(q));
    setSocket(s);
    return () => s.disconnect();
  }, [id]);

  const sendQuestion = (q) => {
    if (!q.trim()) return;
    setQuestion(q);
    socket?.emit('interviewer_question', { sessionId: id, question: q });
  };

  const deleteSession = async () => {
    if (!confirm('Delete this session and all its transcript data? This cannot be undone.')) return;
    await axios.delete(`${auth.apiBase}/api/sessions/${id}`, { headers });
    nav('/');
  };

  const copyQuestion = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!session) return <div style={s.loading}>Loading...</div>;

  const questions = (session.transcript || [])
    .filter((m) => m.role === 'interviewer' && !m.isScreenshot && isActualQuestion(m.content))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <Link to="/" style={s.back}>← Dashboard</Link>
        <div style={s.topCenter}>
          <h2 style={s.title}>{session.title}</h2>
          {session.company && <span style={s.meta}>{session.company}{session.role ? ` · ${session.role}` : ''}</span>}
          <span style={{ ...s.statusBadge, background: session.status === 'active' ? '#16a34a' : '#475569' }}>
            {session.status}
          </span>
        </div>
        <button style={s.deleteBtn} onClick={deleteSession}>🗑 Delete Session</button>
      </div>

      {/* Tab switcher */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'transcript' ? s.tabActive : {}) }} onClick={() => setTab('transcript')}>
          📜 Transcript <span style={s.tabCount}>{session.transcript?.length || 0}</span>
        </button>
        <button style={{ ...s.tab, ...(tab === 'questions' ? s.tabActive : {}) }} onClick={() => setTab('questions')}>
          ❓ Questions <span style={s.tabCount}>{questions.length}</span>
        </button>
      </div>

      <div style={s.layout}>
        {/* Left: transcript or questions panel */}
        {tab === 'transcript' ? (
          <div style={s.panel}>
            <div ref={scrollRef} style={s.messages}>
              {session.transcript?.map((msg, i) => (
                <div key={i} style={{ ...s.msg, background: msg.role === 'interviewer' ? 'rgba(124,58,237,0.1)' : 'rgba(22,163,74,0.1)', borderLeft: `3px solid ${msg.role === 'interviewer' ? '#a78bfa' : '#34d399'}` }}>
                  <span style={{ ...s.msgRole, color: msg.role === 'interviewer' ? '#a78bfa' : '#34d399' }}>
                    {msg.role === 'interviewer' ? '🎤 Interviewer' : '🤖 AI Answer'}
                    {msg.timestamp && <span style={s.msgTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </span>
                  <pre style={s.msgContent}>{msg.content}</pre>
                </div>
              ))}
              {streaming && (
                <div style={{ ...s.msg, background: 'rgba(22,163,74,0.1)', borderLeft: '3px solid #34d399' }}>
                  <span style={{ ...s.msgRole, color: '#34d399' }}>🤖 AI Answer</span>
                  <pre style={s.msgContent}>{answer}<span style={s.cursor}>▊</span></pre>
                </div>
              )}
              {!session.transcript?.length && !streaming && (
                <div style={s.emptyMsg}>No transcript yet — questions sent during the session will appear here.</div>
              )}
            </div>
          </div>
        ) : (
          <div style={s.panel}>
            <div style={s.qList}>
              {questions.length === 0 ? (
                <div style={s.emptyMsg}>No questions recorded in this session.</div>
              ) : (
                questions.map((q, i) => (
                  <div key={i} style={s.qRow}>
                    <div style={s.qBadge}>{i + 1}</div>
                    <div style={s.qBody}>
                      <p style={s.qText}>{q.content}</p>
                      {q.timestamp && (
                        <span style={s.qTime}>{new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <button
                      style={{ ...s.copyBtn, background: copied === i ? 'rgba(52,211,153,0.15)' : 'transparent', borderColor: copied === i ? '#34d399' : 'rgba(255,255,255,0.1)', color: copied === i ? '#34d399' : '#64748b' }}
                      onClick={() => copyQuestion(q.content, i)}
                      title="Copy question"
                    >{copied === i ? '✓' : '⎘'}</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Right: live feed */}
        <div style={s.livePanel}>
          <h3 style={s.panelTitle}>Live Feed</h3>
          {question && (
            <div style={s.questionBox}>
              <p style={s.questionLabel}>Current Question:</p>
              <p style={s.questionText}>{question}</p>
            </div>
          )}
          {(answer || streaming) && (
            <div style={s.answerBox}>
              <p style={s.answerLabel}>{streaming ? '● Streaming...' : 'AI Answer:'}</p>
              <pre style={s.answerText}>{answer}{streaming ? <span style={s.cursor}>▊</span> : null}</pre>
            </div>
          )}
          <div style={s.inputRow}>
            <input style={s.input} placeholder="Send question manually..."
              onKeyDown={(e) => { if (e.key === 'Enter') { sendQuestion(e.target.value); e.target.value = ''; } }} />
          </div>
          <p style={s.hint}>Use the Windows app or mobile app to send questions via voice.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', padding: 24, background: '#0a0a14', color: '#e2e8f0' },
  loading: { padding: 40, color: '#94a3b8' },
  topBar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  back: { color: '#a78bfa', textDecoration: 'none', fontSize: 14, flexShrink: 0 },
  topCenter: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' },
  title: { color: '#e2e8f0', fontSize: 20, fontWeight: 700, margin: 0 },
  meta: { color: '#94a3b8', fontSize: 14 },
  statusBadge: { borderRadius: 4, padding: '2px 8px', color: '#fff', fontSize: 11, flexShrink: 0 },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600, flexShrink: 0 },
  tabs: { display: 'flex', gap: 6, marginBottom: 16 },
  tab: { background: 'rgba(255,255,255,0.04)', border: '1px solid #334155', borderRadius: 8, padding: '7px 16px', color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { background: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed', color: '#a78bfa' },
  tabCount: { background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  panel: { background: '#1e1e2e', borderRadius: 12, padding: 16, border: '1px solid #334155', display: 'flex', flexDirection: 'column', maxHeight: '75vh' },
  messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  msg: { borderRadius: 6, padding: '8px 12px' },
  msgRole: { fontSize: 11, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 },
  msgTime: { color: '#475569', fontWeight: 400, fontSize: 10 },
  msgContent: { color: '#e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0, fontFamily: 'inherit' },
  emptyMsg: { color: '#475569', fontSize: 13, textAlign: 'center', padding: '32px 0' },
  qList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  qRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' },
  qBadge: { width: 24, height: 24, borderRadius: 12, background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  qBody: { flex: 1 },
  qText: { color: '#e2e8f0', fontSize: 14, lineHeight: 1.5, margin: 0 },
  qTime: { color: '#475569', fontSize: 11, marginTop: 4, display: 'block' },
  copyBtn: { border: '1px solid', borderRadius: 5, color: '#64748b', fontSize: 13, cursor: 'pointer', padding: '3px 8px', flexShrink: 0 },
  cursor: { animation: 'blink 1s step-end infinite', color: '#34d399' },
  livePanel: { background: '#1e1e2e', borderRadius: 12, padding: 20, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'start' },
  panelTitle: { color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
  questionBox: { background: 'rgba(124,58,237,0.1)', borderRadius: 8, padding: 12, border: '1px solid rgba(124,58,237,0.3)' },
  questionLabel: { color: '#a78bfa', fontSize: 11, fontWeight: 600, margin: '0 0 4px 0' },
  questionText: { color: '#e2e8f0', fontSize: 14, margin: 0 },
  answerBox: { background: 'rgba(22,163,74,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(22,163,74,0.25)' },
  answerLabel: { color: '#34d399', fontSize: 11, fontWeight: 600, margin: '0 0 4px 0' },
  answerText: { color: '#d1fae5', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0, fontFamily: 'inherit' },
  inputRow: { display: 'flex' },
  input: { flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', outline: 'none', fontSize: 13 },
  hint: { color: '#475569', fontSize: 12, margin: 0 },
};
