import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function TrainingPage({ auth }) {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const [resumeName, setResumeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const headers = { Authorization: `Bearer ${auth.token}` };

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    axios.get(`${auth.apiBase}/api/training`, { headers })
      .then(({ data }) => {
        setRole(data.role || '');
        setSkills((data.skills || []).join(', '));
        setExperience(data.experience || '');
        setSystemPrompt(data.systemPrompt || '');
        setFiles(data.customFiles || []);
        if (data.resume) setResumeName(`Saved (${data.resume.length} chars)`);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setFetchError('Session expired — please log out and log back in.');
        } else if (!err.response) {
          setFetchError('Cannot reach backend. Make sure the server is running on port 4000.');
        } else {
          setFetchError(err.response?.data?.error || err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${auth.apiBase}/api/training/context`,
        { role, skills: skills.split(',').map((s) => s.trim()).filter(Boolean), experience, systemPrompt },
        { headers }
      );
      setStatus('✓ Saved successfully');
      setTimeout(() => setStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post(`${auth.apiBase}/api/training/resume`, fd, { headers });
      setResumeName(data.message || `✓ ${file.name}`);
      setStatus(`✓ Resume saved`);
    } catch (err) {
      setStatus(`✗ ${err.response?.data?.error || err.message}`);
    }
    setTimeout(() => setStatus(''), 4000);
    e.target.value = '';
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await axios.post(`${auth.apiBase}/api/training/file`, fd, { headers });
      setFiles((p) => [...p, { name: file.name, uploadedAt: new Date() }]);
      setStatus(`✓ ${file.name} uploaded`);
    } catch (err) {
      setStatus(`✗ ${err.response?.data?.error || err.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
    e.target.value = '';
  };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <h2 style={s.logo}>Interview AI</h2>
        <div style={s.navLinks}>
          <Link to="/" style={s.navLink}>📋 Sessions</Link>
          <span style={s.navActive}>⚡ Training</span>
          <Link to="/docs" style={s.navLink}>📖 Docs</Link>
        </div>
      </div>

      <main style={s.main}>
        <h1 style={s.heading}>Train My Model</h1>
        <p style={s.sub}>Upload your resume and context so the AI answers in your voice and style.</p>

        {loading && (
          <div style={s.loadingBar}>⏳ Loading your training context...</div>
        )}
        {fetchError && (
          <div style={s.errorBar}>⚠ {fetchError}</div>
        )}

        <div style={s.grid}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Your Role / Job Title</h3>
            <p style={s.hint}>The AI will answer as this person. Be specific for best results.</p>
            <input style={s.input} placeholder="e.g. Senior Frontend Engineer, Data Scientist, DevOps Lead..."
              value={role} onChange={(e) => setRole(e.target.value)} />
            <div style={s.roleExamples}>
              {['Software Engineer','Frontend Developer','Backend Engineer','Full Stack Developer',
                'Data Scientist','ML Engineer','DevOps Engineer','Product Manager','QA Engineer'].map((r) => (
                <button key={r} style={{ ...s.roleChip, background: role === r ? '#7c3aed' : 'rgba(124,58,237,0.1)', borderColor: role === r ? '#7c3aed' : 'rgba(124,58,237,0.3)' }}
                  onClick={() => setRole(r)}>{r}</button>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Skills</h3>
            <textarea style={s.textarea} rows={3} placeholder="React, TypeScript, Node.js, Python..."
              value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Experience Summary</h3>
            <textarea style={s.textarea} rows={5} placeholder="5 years as full-stack developer at..."
              value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Custom Instructions</h3>
            <p style={s.hint}>Override the AI's behavior. E.g. "Always mention your startup experience"</p>
            <textarea style={s.textarea} rows={4} placeholder="Additional instructions for the AI..."
              value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Resume <span style={{ color: '#64748b', fontWeight: 400, fontSize: 12 }}>(PDF or TXT)</span></h3>
            <p style={s.hint}>This is the primary source for personal experience questions. Always upload here — not below.</p>
            {resumeName && (
              <div style={s.resumeStatus}>✓ {resumeName}</div>
            )}
            <label style={{ ...s.uploadLabel, borderColor: resumeName ? 'rgba(52,211,153,0.5)' : 'rgba(124,58,237,0.5)' }}>
              <input type="file" style={{ display: 'none' }} accept=".txt,.pdf,.md" onChange={uploadResume} />
              {resumeName ? '↑ Replace Resume' : '+ Upload Resume'}
            </label>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Other Files</h3>
            <p style={s.hint}>Portfolio, project docs, cover letters — additional context.</p>
            <label style={s.uploadLabel}>
              <input type="file" style={{ display: 'none' }} accept=".txt,.pdf,.md,.doc,.docx" onChange={uploadFile} />
              + Upload File
            </label>
            <div style={s.fileList}>
              {files.map((f, i) => (
                <div key={i} style={s.fileItem}>
                  <span>📄</span>
                  <span style={{ flex: 1 }}>{f.name}</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>
                    {f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={s.footer}>
          {status && <span style={s.statusMsg}>{status}</span>}
          <button style={s.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Training Context'}
          </button>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1e1e2e', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid #334155', flexShrink: 0 },
  logo: { color: '#a78bfa', fontSize: 18, fontWeight: 800 },
  navLinks: { display: 'flex', flexDirection: 'column', gap: 4 },
  navActive: { color: '#e2e8f0', padding: '8px 12px', background: 'rgba(124,58,237,0.2)', borderRadius: 8, fontSize: 14 },
  navLink: { color: '#94a3b8', padding: '8px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', display: 'block' },
  main: { flex: 1, padding: 32 },
  heading: { color: '#e2e8f0', fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#1e1e2e', borderRadius: 12, padding: 20, border: '1px solid #334155' },
  cardTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 10 },
  hint: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  input: { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', marginBottom: 10 },
  roleExamples: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  roleChip: { padding: '4px 10px', borderRadius: 20, border: '1px solid', color: '#e2e8f0', fontSize: 12, cursor: 'pointer' },
  textarea: { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, resize: 'vertical', outline: 'none', lineHeight: 1.6 },
  resumeStatus: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 6, padding: '6px 10px', color: '#34d399', fontSize: 12, marginBottom: 8 },
  uploadLabel: { display: 'block', background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.5)', borderRadius: 8, padding: 14, textAlign: 'center', color: '#a78bfa', cursor: 'pointer', marginBottom: 10 },
  fileList: { display: 'flex', flexDirection: 'column', gap: 4 },
  fileItem: { display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', color: '#94a3b8', fontSize: 13, borderBottom: '1px solid #1e293b' },
  footer: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 24 },
  statusMsg: { color: '#34d399', fontSize: 14 },
  saveBtn: { padding: '12px 28px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  loadingBar: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '10px 16px', color: '#a78bfa', fontSize: 13, marginBottom: 16 },
  errorBar: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', color: '#f87171', fontSize: 13, marginBottom: 16 },
};
