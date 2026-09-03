import React, { useState } from 'react';

const IPC_DATA = [
  { section: 'IPC 302', title: 'Murder', category: 'Criminal', bailable: false, punishment: 'Death or Life Imprisonment', desc: 'Whoever commits murder shall be punished.' },
  { section: 'IPC 376', title: 'Rape', category: 'Criminal', bailable: false, punishment: '10 years to Life', desc: 'Punishment for rape.' },
  { section: 'IPC 420', title: 'Cheating & Dishonesty', category: 'Criminal', bailable: false, punishment: 'Up to 7 years + fine', desc: 'Cheating and dishonestly inducing delivery of property.' },
  { section: 'IPC 498A', title: 'Cruelty by Husband', category: 'Family', bailable: false, punishment: 'Up to 3 years + fine', desc: 'Husband or relative subjecting woman to cruelty.' },
  { section: 'IPC 406', title: 'Criminal Breach of Trust', category: 'Criminal', bailable: false, punishment: 'Up to 3 years', desc: 'Punishment for criminal breach of trust.' },
  { section: 'IPC 323', title: 'Voluntarily Causing Hurt', category: 'Criminal', bailable: true, punishment: 'Up to 1 year / fine ₹1000', desc: 'Voluntarily causing hurt to any person.' },
  { section: 'IPC 379', title: 'Theft', category: 'Criminal', bailable: false, punishment: 'Up to 3 years + fine', desc: 'Punishment for theft.' },
  { section: 'IPC 499', title: 'Defamation', category: 'Civil', bailable: true, punishment: 'Up to 2 years + fine', desc: 'Whoever makes or publishes imputation to harm reputation.' },
  { section: 'IPC 166A', title: 'FIR Refusal by Police', category: 'Police', bailable: false, punishment: '6 months to 2 years', desc: 'Public servant disobeying direction of law.' },
  { section: 'CrPC 154', title: 'FIR Registration', category: 'Procedure', bailable: null, punishment: 'N/A — Procedural Right', desc: 'Every person has right to register FIR.' },
  { section: 'CrPC 125', title: 'Maintenance', category: 'Family', bailable: null, punishment: 'N/A', desc: 'Order for maintenance of wives, children, and parents.' },
  { section: 'CrPC 437', title: 'Bail in Non-Bailable Cases', category: 'Bail', bailable: null, punishment: 'N/A', desc: 'When bail may be taken in non-bailable offence.' },
  { section: 'RTI Act Sec 6', title: 'RTI Application', category: 'RTI', bailable: null, punishment: 'N/A', desc: 'Request for obtaining information.' },
  { section: 'RTI Act Sec 7', title: 'RTI Response', category: 'RTI', bailable: null, punishment: 'N/A', desc: 'Disposal of request. 30 days mandatory.' },
  { section: 'PWDVA Sec 12', title: 'Domestic Violence Protection', category: 'Family', bailable: null, punishment: 'N/A', desc: 'Application to Magistrate for protection order.' },
  { section: 'IT Act 66D', title: 'Cyber Fraud', category: 'Cyber', bailable: false, punishment: 'Up to 3 years + fine ₹1L', desc: 'Cheating by personation using communication device.' },
  { section: 'IDA Sec 25F', title: 'Wrongful Termination', category: 'Labour', bailable: null, punishment: 'Compensation', desc: 'Conditions precedent to retrenchment of workmen.' },
  { section: 'Gratuity Act Sec 4', title: 'Gratuity Payment', category: 'Labour', bailable: null, punishment: 'Mandatory payment', desc: 'Payment of gratuity to employees (5+ years service).' },
  { section: 'Article 21', title: 'Right to Life', category: 'Constitutional', bailable: null, punishment: 'N/A', desc: 'No person shall be deprived of life or personal liberty.' },
  { section: 'Article 19(1)(a)', title: 'Freedom of Speech', category: 'Constitutional', bailable: null, punishment: 'N/A', desc: 'Right to freedom of speech and expression.' },
  { section: 'Consumer Act Sec 35', title: 'Consumer Complaint', category: 'Consumer', bailable: null, punishment: 'N/A', desc: 'Complaints before District Consumer Forum.' },
  { section: 'NI Act Sec 138', title: 'Cheque Bounce', category: 'Civil', bailable: false, punishment: 'Up to 2 years + fine 2x cheque amt', desc: 'Dishonour of cheque for insufficiency of funds.' },
];

const CATEGORIES = ['All', 'Criminal', 'Family', 'Procedure', 'RTI', 'Cyber', 'Labour', 'Consumer', 'Constitutional', 'Civil', 'Bail', 'Police'];

export default function IPCKnowledgePanel({ onClose }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = IPC_DATA.filter(item => {
    const matchesSearch = search === '' ||
      item.section.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>📚 IPC/CrPC Knowledge Base</div>
            <div style={styles.subtitle}>All Major Indian Laws — Searchable</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.searchRow}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sections, laws, keywords..."
            style={styles.searchInput}
          />
          <span style={styles.resultCount}>{filtered.length} sections</span>
        </div>

        <div style={styles.categories}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ ...styles.catBtn, ...(activeCategory === cat ? styles.catBtnActive : {}) }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          <div style={styles.listCol}>
            {filtered.map((item) => (
              <div key={item.section} onClick={() => setSelected(item)}
                style={{ ...styles.listItem, ...(selected?.section === item.section ? styles.listItemActive : {}) }}>
                <div style={styles.sectionCode}>{item.section}</div>
                <div style={styles.sectionTitle}>{item.title}</div>
                <span style={{ ...styles.catTag, background: getCatColor(item.category) }}>{item.category}</span>
              </div>
            ))}
          </div>

          {selected && (
            <div style={styles.detailCol}>
              <div style={styles.detailSection}>{selected.section}</div>
              <div style={styles.detailTitle}>{selected.title}</div>
              <div style={styles.detailDesc}>{selected.desc}</div>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Bailable</div>
                  <div style={{ ...styles.detailVal, color: selected.bailable === null ? '#9ca3af' : selected.bailable ? '#22c55e' : '#ef4444' }}>
                    {selected.bailable === null ? 'N/A' : selected.bailable ? 'Yes ✓' : 'No ✗'}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Punishment</div>
                  <div style={styles.detailVal}>{selected.punishment}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Category</div>
                  <div style={styles.detailVal}>{selected.category}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getCatColor = (cat) => {
  const colors = {
    Criminal: 'rgba(239,68,68,0.2)', Family: 'rgba(139,92,246,0.2)', Procedure: 'rgba(20,184,166,0.2)',
    RTI: 'rgba(59,130,246,0.2)', Cyber: 'rgba(6,182,212,0.2)', Labour: 'rgba(245,158,11,0.2)',
    Consumer: 'rgba(16,185,129,0.2)', Constitutional: 'rgba(251,191,36,0.2)', Civil: 'rgba(156,163,175,0.2)',
    Bail: 'rgba(249,115,22,0.2)', Police: 'rgba(239,68,68,0.15)',
  };
  return colors[cat] || 'rgba(55,65,81,0.2)';
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { background: '#0a0f1a', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 860, height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(20,184,166,0.12)' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2dd4bf', fontWeight: 700 },
  subtitle: { fontSize: 12, color: '#4b5563', fontFamily: 'Mukta', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' },
  searchRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(20,184,166,0.08)' },
  searchInput: { flex: 1, background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontFamily: 'Mukta', fontSize: 14, outline: 'none' },
  resultCount: { fontSize: 12, color: '#4b5563', fontFamily: 'Mukta', whiteSpace: 'nowrap' },
  categories: { display: 'flex', gap: 6, padding: '10px 24px', borderBottom: '1px solid rgba(20,184,166,0.08)', flexWrap: 'wrap' },
  catBtn: { padding: '3px 12px', borderRadius: 100, border: '1px solid rgba(55,65,81,0.4)', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 11, fontFamily: 'Mukta' },
  catBtnActive: { background: 'rgba(20,184,166,0.2)', borderColor: 'rgba(20,184,166,0.5)', color: '#5eead4' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  listCol: { width: 340, overflowY: 'auto', borderRight: '1px solid rgba(20,184,166,0.08)' },
  listItem: { padding: '12px 20px', borderBottom: '1px solid rgba(20,184,166,0.06)', cursor: 'pointer', transition: 'all 0.15s' },
  listItemActive: { background: 'rgba(20,184,166,0.1)', borderLeft: '2px solid #14b8a6' },
  sectionCode: { fontSize: 12, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
  sectionTitle: { fontSize: 13, color: '#e5e7eb', fontFamily: 'Mukta', fontWeight: 500, marginTop: 2 },
  catTag: { display: 'inline-block', fontSize: 10, padding: '1px 8px', borderRadius: 100, color: '#9ca3af', marginTop: 4, fontFamily: 'Mukta' },
  detailCol: { flex: 1, padding: 28, overflowY: 'auto' },
  detailSection: { fontSize: 13, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, marginBottom: 6 },
  detailTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#f0fdfa', fontWeight: 700, marginBottom: 12 },
  detailDesc: { fontSize: 14, color: '#9ca3af', fontFamily: 'Mukta', lineHeight: 1.7, marginBottom: 24, background: 'rgba(17,24,39,0.4)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(55,65,81,0.3)' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  detailItem: { background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 10, padding: '12px 14px' },
  detailLabel: { fontSize: 10, color: '#4b5563', fontFamily: 'Mukta', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  detailVal: { fontSize: 13, color: '#d1d5db', fontFamily: 'Mukta', fontWeight: 600 },
};
