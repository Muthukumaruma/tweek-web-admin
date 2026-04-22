import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/${mode}`, form);
      onLogin({ ...data, apiBase: API });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.logo}>Interview AI</h1>
        <p style={s.sub}>Admin Dashboard</p>
        <form onSubmit={submit} style={s.form}>
          {mode === 'register' && (
            <input style={s.input} placeholder="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          )}
          <input style={s.input} placeholder="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input style={s.input} placeholder="Password" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={s.toggle} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Don't have an account? Register" : 'Already have account? Sign in'}
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0a14 70%)' },
  card: { background: '#1e1e2e', borderRadius: 16, padding: 40, width: 380, border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  logo: { color: '#a78bfa', fontSize: 28, fontWeight: 800, textAlign: 'center' },
  sub: { color: '#64748b', textAlign: 'center', marginBottom: 28, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' },
  btn: { padding: 13, background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  error: { color: '#f87171', fontSize: 13 },
  toggle: { color: '#a78bfa', fontSize: 13, textAlign: 'center', marginTop: 16, cursor: 'pointer' },
};
