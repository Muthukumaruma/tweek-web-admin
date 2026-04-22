import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function SessionDetailPage({ auth }) {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [question, setQuestion] = useState('');
  const [socket, setSocket] = useState(null);
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
    s.on('ai_answer_done', ({ answer: full }) => { setAnswer(full); setStreaming(false); });
    s.on('question_received', ({ question: q }) => setQuestion(q));
    setSocket(s);
    return () => s.disconnect();
  }, [id]);

  const sendQuestion = (q) => {
    if (!q.trim()) return;
    setQuestion(q);
    socket?.emit('interviewer_question', { sessionId: id, question: q });
  };

  if (!session) return <div style={{ padding: 40, color: '#94a3b8' }}>Loading...</div>;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <Link to="/" style={s.back}>← Dashboard</Link>
        <h2 style={s.title}>{session.title}</h2>
        {session.company && <span style={s.meta}>{session.company} · {session.role}</span>}
      </div>

      <div style={s.layout}>
        {/* Transcript panel */}
        <div style={s.transcriptPanel}>
          <h3 style={s.panelTitle}>Transcript</h3>
          <div ref={scrollRef} style={s.messages}>
            {session.transcript?.map((msg, i) => (
              <div key={i} style={{ ...s.msg, background: msg.role === 'interviewer' ? 'rgba(124,58,237,0.1)' : 'rgba(22,163,74,0.1)', borderLeft: `3px solid ${msg.role === 'interviewer' ? '#a78bfa' : '#34d399'}` }}>
                <span style={{ ...s.msgRole, color: msg.role === 'interviewer' ? '#a78bfa' : '#34d399' }}>
                  {msg.role === 'interviewer' ? '🎤 Interviewer' : '🤖 AI Answer'}
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
          </div>
        </div>

        {/* Live panel */}
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
              <p style={s.answerLabel}>{streaming ? '● Streaming answer...' : 'AI Answer:'}</p>
              <pre style={s.answerText}>{answer}{streaming ? <span style={s.cursor}>▊</span> : null}</pre>
            </div>
          )}
          <div style={s.inputRow}>
            <input style={s.input} placeholder="Send question manually..."
              onKeyDown={(e) => { if (e.key === 'Enter') { sendQuestion(e.target.value); e.target.value = ''; } }} />
          </div>
          <p style={s.hint}>Use the Windows app or mobile app to send questions via voice / auto-transcript.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', padding: 24 },
  topBar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  back: { color: '#a78bfa', textDecoration: 'none', fontSize: 14 },
  title: { color: '#e2e8f0', fontSize: 20, fontWeight: 700 },
  meta: { color: '#94a3b8', fontSize: 14 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  transcriptPanel: { background: '#1e1e2e', borderRadius: 12, padding: 20, border: '1px solid #334155', display: 'flex', flexDirection: 'column', maxHeight: '80vh' },
  livePanel: { background: '#1e1e2e', borderRadius: 12, padding: 20, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 12 },
  panelTitle: { color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  msg: { borderRadius: 6, padding: '8px 12px' },
  msgRole: { fontSize: 11, fontWeight: 600, marginBottom: 4, display: 'block' },
  msgContent: { color: '#e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0, fontFamily: 'inherit' },
  cursor: { animation: 'blink 1s step-end infinite', color: '#34d399' },
  questionBox: { background: 'rgba(124,58,237,0.1)', borderRadius: 8, padding: 12, border: '1px solid rgba(124,58,237,0.3)' },
  questionLabel: { color: '#a78bfa', fontSize: 11, fontWeight: 600, marginBottom: 4 },
  questionText: { color: '#e2e8f0', fontSize: 14 },
  answerBox: { background: 'rgba(22,163,74,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(22,163,74,0.25)', flex: 1 },
  answerLabel: { color: '#34d399', fontSize: 11, fontWeight: 600, marginBottom: 4 },
  answerText: { color: '#d1fae5', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0, fontFamily: 'inherit' },
  inputRow: { display: 'flex' },
  input: { flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', outline: 'none', fontSize: 13 },
  hint: { color: '#475569', fontSize: 12 },
};
