import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SessionDetailPage from './pages/SessionDetailPage';
import TrainingPage from './pages/TrainingPage';
import DocsPage from './pages/DocsPage';

export default function App() {
  const [auth, setAuth] = useState(() => {
    const s = localStorage.getItem('it_auth');
    return s ? JSON.parse(s) : null;
  });

  const login = (data) => { localStorage.setItem('it_auth', JSON.stringify(data)); setAuth(data); };
  const logout = () => { localStorage.removeItem('it_auth'); setAuth(null); };

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/" /> : <LoginPage onLogin={login} />} />
      <Route path="/" element={auth ? <DashboardPage auth={auth} onLogout={logout} /> : <Navigate to="/login" />} />
      <Route path="/session/:id" element={auth ? <SessionDetailPage auth={auth} /> : <Navigate to="/login" />} />
      <Route path="/training" element={auth ? <TrainingPage auth={auth} /> : <Navigate to="/login" />} />
      <Route path="/docs" element={auth ? <DocsPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}
