import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/users/dashboard?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return res.json();
      })
      .then(data => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Session expired or error loading dashboard');
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            <span style={styles.logoIcon}>⚖️</span>
            <div>
              <div style={styles.logoTitle}>NyayMitra</div>
              <div style={styles.logoSub}>User Dashboard</div>
            </div>
          </div>
          <div style={styles.navActions}>
            <span style={styles.userName}>👤 {user.name}</span>
            <button onClick={() => navigate('/chat')} style={styles.newChatBtn}>+ New Case</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.title}>Your Legal Cases</h1>
        <p style={styles.subtitle}>Track your past sessions and view replies from our legal experts.</p>

        {loading ? (
          <div style={styles.loading}>Loading your cases...</div>
        ) : sessions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
            <h3>No cases yet</h3>
            <p>You haven't started any legal consultations.</p>
            <button onClick={() => navigate('/chat')} style={styles.newChatBtnLarge}>Start Now</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {sessions.map((session, idx) => (
              <div key={session.session_id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>Case #{session.session_id.substring(0, 6)}</div>
                  <div style={styles.cardDate}>
                    {new Date(session.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div style={styles.previewText}>"{session.preview}"</div>
                
                {session.has_admin_reply && (
                  <div style={styles.adminAlert}>
                    <span style={{ fontSize: 16 }}>👨‍⚖️</span>
                    <div>
                      <strong>Expert Reply Available</strong>
                      <div>An admin/lawyer has responded to this case.</div>
                    </div>
                  </div>
                )}
                
                <div style={styles.cardFooter}>
                  <div style={styles.msgCount}>{session.messages.length} messages</div>
                  <button style={styles.viewBtn} onClick={() => {
                    // For demo purposes, we can navigate back to chat and inject this session
                    // Note: full implementation would require ChatPage to accept a session ID
                    localStorage.setItem('resume_session', session.session_id);
                    navigate('/chat');
                  }}>View Chat →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#030712', color: '#f3f4f6' },
  nav: { background: 'rgba(3,7,18,0.95)', borderBottom: '1px solid rgba(20,184,166,0.2)', padding: '16px 0' },
  navInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' },
  logo: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  logoIcon: { fontSize: 24 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#2dd4bf' },
  logoSub: { fontSize: 10, color: '#fbbf24', fontFamily: 'Mukta', letterSpacing: 2 },
  navActions: { display: 'flex', alignItems: 'center', gap: 20 },
  userName: { fontSize: 14, fontFamily: 'Mukta', color: '#9ca3af' },
  newChatBtn: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 13, fontWeight: 600 },
  logoutBtn: { background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 13 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#f0fdfa', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontFamily: 'Mukta', fontSize: 16, marginBottom: 40 },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: 'rgba(17,24,39,0.5)', borderRadius: 20, border: '1px dashed rgba(75,85,99,0.5)' },
  newChatBtnLarge: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600, marginTop: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  card: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s', ':hover': { borderColor: 'rgba(20,184,166,0.4)', transform: 'translateY(-2px)' } },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: 'Mukta', fontWeight: 600, color: '#e5e7eb', fontSize: 15 },
  cardDate: { fontSize: 12, color: '#6b7280', fontFamily: 'Mukta' },
  previewText: { fontSize: 14, color: '#9ca3af', fontStyle: 'italic', background: 'rgba(3,7,18,0.4)', padding: '12px', borderRadius: 8 },
  adminAlert: { display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '12px', color: '#c4b5fd', fontSize: 13, fontFamily: 'Mukta' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(75,85,99,0.2)' },
  msgCount: { fontSize: 12, color: '#6b7280', fontFamily: 'Mukta' },
  viewBtn: { background: 'none', border: 'none', color: '#5eead4', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 13, fontWeight: 600 }
};
