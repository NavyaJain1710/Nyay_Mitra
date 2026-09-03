import React from 'react';

const TAG_COLORS = {
  property: { bg: 'rgba(139,92,246,0.2)', color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
  criminal: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  general: { bg: 'rgba(20,184,166,0.2)', color: '#5eead4', border: 'rgba(20,184,166,0.3)' },
  cyber: { bg: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  labour: { bg: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
};

const DOC_TEMPLATES = [
  { id: 'fir', icon: '🚨', name: 'FIR Application', desc: 'Police complaint' },
  { id: 'rti', icon: '📋', name: 'RTI Application', desc: 'Info request' },
  { id: 'notice', icon: '📜', name: 'Legal Notice', desc: 'Formal notice' },
  { id: 'complaint', icon: '📝', name: 'Consumer Complaint', desc: 'Consumer court' },
  { id: 'bail', icon: '⚖️', name: 'Bail Application', desc: 'Bail request' },
  { id: 'affidavit', icon: '🗒️', name: 'Affidavit', desc: 'Sworn statement' },
];

export default function Sidebar({ isOpen, chatHistory, language, onLanguageChange, languages, onNewChat, onNavigate, onGenerateDoc, onShowIPC, onShowTimeline, onShowPredictor, onPrint }) {
  if (!isOpen) return null;

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.sidebarHeader}>
        <div style={styles.logo}>
          <span style={{ fontSize: 24 }}>⚖️</span>
          <div>
            <div style={styles.logoTitle}>NyayMitra</div>
            <div style={styles.logoSub}>न्यायमित्र · V3</div>
          </div>
        </div>
        <button onClick={onNewChat} style={styles.newChatBtn}>+ New</button>
      </div>

      <div style={styles.scrollArea} className="scroll-area">
        {/* Language — 12 Regional */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>🌐 Language (12 Regional)</div>
          <div style={styles.langGrid}>
            {(languages || []).slice(0, 12).map((lang) => (
              <button key={lang.code} onClick={() => onLanguageChange(lang.code)}
                style={{ ...styles.langBtn, ...(language === lang.code ? styles.langBtnActive : {}) }}>
                <span>{lang.flag}</span>
                <span style={styles.langLabel}>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* V3 Features */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>✨ V3 Features</div>
          <div style={styles.featureList}>
            <button onClick={onShowIPC} style={styles.featureItem}>
              <span>📚</span>
              <div>
                <div style={styles.featureName}>IPC/CrPC Knowledge Base</div>
                <div style={styles.featureDesc}>Search all major Indian laws</div>
              </div>
            </button>
            <button onClick={onShowTimeline} style={styles.featureItem}>
              <span>📅</span>
              <div>
                <div style={styles.featureName}>Legal Process Timeline</div>
                <div style={styles.featureDesc}>FIR → Conviction, step-by-step</div>
              </div>
            </button>
            <button onClick={onShowPredictor} style={styles.featureItem}>
              <span>📊</span>
              <div>
                <div style={styles.featureName}>Case Outcome Predictor</div>
                <div style={styles.featureDesc}>Win/Lose % with AI reasoning</div>
              </div>
            </button>
            <button onClick={onPrint} style={styles.featureItem}>
              <span>🖨️</span>
              <div>
                <div style={styles.featureName}>Print Documents</div>
                <div style={styles.featureDesc}>Print any generated document</div>
              </div>
            </button>
          </div>
        </div>

        {/* Document Templates */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>📄 Generate Documents</div>
          <div style={styles.docList}>
            {DOC_TEMPLATES.map((doc) => (
              <button key={doc.id} onClick={() => onGenerateDoc(doc.id)} style={styles.docItem}>
                <span style={styles.docIcon}>{doc.icon}</span>
                <div>
                  <div style={styles.docName}>{doc.name}</div>
                  <div style={styles.docDesc}>{doc.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>💬 Recent Chats</div>
          <div style={styles.historyList}>
            {chatHistory.map((chat) => {
              const tagStyle = TAG_COLORS[chat.tag] || TAG_COLORS.general;
              return (
                <div key={chat.id} style={styles.historyItem}>
                  <div style={styles.historyTitle}>{chat.title}</div>
                  <div style={styles.historyMeta}>
                    <span style={{ ...styles.historyTag, background: tagStyle.bg, color: tagStyle.color, border: `1px solid ${tagStyle.border}` }}>{chat.tag}</span>
                    <span style={styles.historyDate}>{chat.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.section}>
          <button onClick={() => onNavigate('/documents')} style={styles.navBtn}>📑 Document Center</button>
          <button onClick={() => onNavigate('/')} style={styles.navBtn}>🏠 Home</button>
          <a href={window.location.hostname ? `http://${window.location.hostname}:8001` : 'http://localhost:8001'} target="_blank" rel="noreferrer" style={{ ...styles.navBtn, display: 'block', textDecoration: 'none', color: '#9ca3af' }}>
            🛡️ Admin Dashboard
          </a>
        </div>

        {/* Emergency */}
        <div style={styles.emergencyBox}>
          <div style={styles.emergencyTitle}>🆘 Emergency Helplines</div>
          <div style={styles.emergencyList}>
            <div style={styles.emergencyItem}><span>Police:</span> <a href="tel:100" style={styles.emergencyNum}>100</a></div>
            <div style={styles.emergencyItem}><span>Women:</span> <a href="tel:1091" style={styles.emergencyNum}>1091</a></div>
            <div style={styles.emergencyItem}><span>Legal Aid:</span> <a href="tel:15100" style={styles.emergencyNum}>15100</a></div>
            <div style={styles.emergencyItem}><span>Cyber:</span> <a href="tel:1930" style={styles.emergencyNum}>1930</a></div>
            <div style={styles.emergencyItem}><span>Consumer:</span> <a href="tel:18001144000" style={styles.emergencyNum}>1800-114-400</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: { width: 280, height: '100vh', background: '#0a0f1a', borderRight: '1px solid rgba(20,184,166,0.15)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 20 },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 14px', borderBottom: '1px solid rgba(20,184,166,0.12)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#2dd4bf', fontWeight: 700 },
  logoSub: { fontSize: 10, color: '#fbbf24', fontFamily: 'Mukta', letterSpacing: 1 },
  newChatBtn: { background: 'rgba(15,118,110,0.3)', border: '1px solid rgba(20,184,166,0.4)', color: '#5eead4', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta', fontWeight: 600 },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  section: { padding: '12px 14px', borderBottom: '1px solid rgba(20,184,166,0.08)' },
  sectionLabel: { fontSize: 10, letterSpacing: 1.2, color: '#4b5563', fontFamily: 'Mukta', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 },
  langGrid: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  langBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 6px', background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 8, cursor: 'pointer', fontSize: 13, width: 48 },
  langBtnActive: { background: 'rgba(15,118,110,0.3)', borderColor: 'rgba(20,184,166,0.5)', boxShadow: '0 0 10px rgba(20,184,166,0.2)' },
  langLabel: { fontSize: 9, color: '#9ca3af', fontFamily: 'Mukta' },
  featureList: { display: 'flex', flexDirection: 'column', gap: 4 },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(20,184,166,0.1)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontSize: 16 },
  featureName: { fontSize: 12, color: '#e5e7eb', fontFamily: 'Mukta', fontWeight: 500 },
  featureDesc: { fontSize: 10, color: '#4b5563', fontFamily: 'Mukta' },
  docList: { display: 'flex', flexDirection: 'column', gap: 4 },
  docItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 8, cursor: 'pointer', textAlign: 'left' },
  docIcon: { fontSize: 16, flexShrink: 0 },
  docName: { fontSize: 12, color: '#e5e7eb', fontFamily: 'Mukta', fontWeight: 500 },
  docDesc: { fontSize: 10, color: '#4b5563', fontFamily: 'Mukta' },
  historyList: { display: 'flex', flexDirection: 'column', gap: 4 },
  historyItem: { padding: '7px 10px', background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(55,65,81,0.2)', borderRadius: 8, cursor: 'pointer' },
  historyTitle: { fontSize: 12, color: '#9ca3af', fontFamily: 'Mukta', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  historyMeta: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  historyTag: { fontSize: 10, padding: '1px 6px', borderRadius: 100, fontFamily: 'Mukta' },
  historyDate: { fontSize: 10, color: '#374151', fontFamily: 'Mukta' },
  navBtn: { display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#6b7280', padding: '7px 10px', cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta', borderRadius: 6, marginBottom: 2 },
  emergencyBox: { margin: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: 12 },
  emergencyTitle: { fontSize: 11, color: '#fca5a5', fontFamily: 'Mukta', fontWeight: 600, marginBottom: 8 },
  emergencyList: { display: 'flex', flexDirection: 'column', gap: 5 },
  emergencyItem: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', fontFamily: 'Mukta' },
  emergencyNum: { color: '#fbbf24', fontWeight: 700, textDecoration: 'none', fontSize: 12 },
};
