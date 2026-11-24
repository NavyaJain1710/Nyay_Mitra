import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin && !isLogin) {
      toast.error('Admin signup is restricted.');
      return;
    }
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const endpoint = isAdmin 
      ? `${API_URL}/api/auth/admin/login` 
      : `${API_URL}/api/users/${isLogin ? 'login' : 'signup'}`;
      
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.detail || 'Authentication failed');
        return;
      }
      
      toast.success('Successfully authenticated!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (isAdmin) {
        const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'http://localhost:8001';
        const targetUrl = ADMIN_URL.includes('?') ? `${ADMIN_URL}&api=${encodeURIComponent(API_URL)}` : `${ADMIN_URL}?api=${encodeURIComponent(API_URL)}`;
        window.location.href = targetUrl; // Admin Dashboard
      } else {
        navigate('/dashboard'); // User Dashboard
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoIcon}>⚖️</span>
          <div>
            <div style={styles.logoTitle}>NyayMitra</div>
            <div style={styles.logoSub}>न्यायमित्र</div>
          </div>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.toggleGroup}>
            <button 
              style={isAdmin ? styles.toggleBtn : styles.toggleBtnActive} 
              onClick={() => setIsAdmin(false)}>User</button>
            <button 
              style={isAdmin ? styles.toggleBtnActive : styles.toggleBtn} 
              onClick={() => setIsAdmin(true)}>Admin</button>
          </div>
          
          <h2 style={styles.title}>
            {isAdmin ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && !isAdmin && (
              <input 
                type="text" 
                placeholder="Full Name" 
                style={styles.input}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Email Address" 
              style={styles.input}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="submit" style={styles.submitBtn}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {!isAdmin && (
            <div style={styles.switchMode}>
              <span style={{ color: '#9ca3af' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                style={styles.switchBtn}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#030712', color: '#f3f4f6', display: 'flex', flexDirection: 'column' },
  nav: { padding: '16px 48px', borderBottom: '1px solid rgba(20,184,166,0.1)' },
  logo: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: 'fit-content' },
  logoIcon: { fontSize: 24 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#2dd4bf' },
  logoSub: { fontSize: 10, color: '#fbbf24', fontFamily: 'Mukta', letterSpacing: 2 },
  container: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, backdropFilter: 'blur(12px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  toggleGroup: { display: 'flex', background: 'rgba(3,7,18,0.6)', borderRadius: 8, padding: 4, marginBottom: 30 },
  toggleBtn: { flex: 1, padding: 10, background: 'none', border: 'none', color: '#9ca3af', borderRadius: 6, cursor: 'pointer', fontFamily: 'Mukta' },
  toggleBtnActive: { flex: 1, padding: 10, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', color: '#5eead4', borderRadius: 6, cursor: 'pointer', fontFamily: 'Mukta', fontWeight: 600 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#f0fdfa', marginBottom: 24, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: { background: 'rgba(3,7,18,0.6)', border: '1px solid rgba(75,85,99,0.4)', borderRadius: 10, padding: '14px 16px', color: '#e5e7eb', fontFamily: 'Mukta', fontSize: 15, outline: 'none' },
  submitBtn: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600, marginTop: 8 },
  switchMode: { marginTop: 24, textAlign: 'center', fontSize: 14, fontFamily: 'Mukta' },
  switchBtn: { background: 'none', border: 'none', color: '#5eead4', cursor: 'pointer', fontWeight: 600, fontFamily: 'Mukta', padding: 0 }
};
