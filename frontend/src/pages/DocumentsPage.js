import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentModal from '../components/DocumentModal';

const DOCS = [
  { id: 'fir', icon: '🚨', title: 'FIR Application', desc: 'File a First Information Report with police', category: 'Criminal', color: '#ef4444' },
  { id: 'rti', icon: '📋', title: 'RTI Application', desc: 'Request information from government departments', category: 'Government', color: '#3b82f6' },
  { id: 'notice', icon: '📜', title: 'Legal Notice', desc: 'Send formal legal notice to any party', category: 'Civil', color: '#f59e0b' },
  { id: 'complaint', icon: '📝', title: 'Consumer Complaint', desc: 'File in consumer court against seller/service', category: 'Consumer', color: '#8b5cf6' },
  { id: 'bail', icon: '⚖️', title: 'Bail Application', desc: 'Apply for regular or anticipatory bail', category: 'Criminal', color: '#0f766e' },
  { id: 'affidavit', icon: '🗒️', title: 'Affidavit', desc: 'Sworn statement for any legal purpose', category: 'General', color: '#14b8a6' },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [activeDoc, setActiveDoc] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/chat')} style={styles.backBtn}>← Back to Chat</button>
        <div style={styles.headerTitle}>📑 Legal Document Center</div>
        <div style={styles.headerSub}>Generate legally accurate documents instantly</div>
      </div>

      <div style={styles.grid}>
        {DOCS.map((doc) => (
          <div key={doc.id} style={styles.card} onClick={() => setActiveDoc(doc.id)}>
            <div style={{ ...styles.cardIcon, background: `${doc.color}22`, border: `1px solid ${doc.color}44` }}>
              {doc.icon}
            </div>
            <div style={{ ...styles.cardCategory, color: doc.color }}>{doc.category}</div>
            <h3 style={styles.cardTitle}>{doc.title}</h3>
            <p style={styles.cardDesc}>{doc.desc}</p>
            <button style={{ ...styles.cardBtn, background: `${doc.color}22`, color: doc.color, borderColor: `${doc.color}44` }}>
              Generate →
            </button>
          </div>
        ))}
      </div>

      {activeDoc && <DocumentModal docType={activeDoc} onClose={() => setActiveDoc(null)} />}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#030712', padding: '40px 5vw', overflow: 'auto' },
  header: { textAlign: 'center', marginBottom: 56 },
  backBtn: { background: 'none', border: '1px solid rgba(75,85,99,0.4)', color: '#9ca3af', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta', marginBottom: 24, display: 'inline-block' },
  headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#f0fdfa', fontWeight: 700, marginBottom: 12 },
  headerSub: { color: '#6b7280', fontFamily: 'Mukta', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' },
  card: { background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10 },
  cardIcon: { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 },
  cardCategory: { fontSize: 11, letterSpacing: 1.5, fontFamily: 'Mukta', fontWeight: 600, textTransform: 'uppercase' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#f0fdfa', fontWeight: 700 },
  cardDesc: { fontSize: 14, color: '#6b7280', fontFamily: 'Mukta', lineHeight: 1.6, flex: 1 },
  cardBtn: { border: '1px solid', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta', fontWeight: 600, alignSelf: 'flex-start', marginTop: 4 },
};
