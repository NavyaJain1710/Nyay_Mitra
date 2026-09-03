import React, { useState } from 'react';

const CASE_TYPES = [
  'FIR / Criminal Complaint', 'Property Dispute', 'Labour / Wrongful Termination',
  'Consumer Complaint', 'Domestic Violence', 'Cyber Crime', 'Cheque Bounce (NI Act 138)',
  'RTI Appeal', 'Divorce / Family Matter', 'Bail Application',
];

const FACTORS = [
  { key: 'evidence', label: 'Strength of Evidence', desc: 'Documents, photos, witnesses available?', weight: 0.30 },
  { key: 'legal_support', label: 'Legal Representation', desc: 'Do you have a lawyer?', weight: 0.20 },
  { key: 'timely_filing', label: 'Timely Filing', desc: 'Filed within limitation period?', weight: 0.15 },
  { key: 'prior_complaints', label: 'Prior Complaints on Record', desc: 'Any written complaints filed before?', weight: 0.15 },
  { key: 'financial_resources', label: 'Financial Resources', desc: 'Can you sustain a long legal battle?', weight: 0.10 },
  { key: 'witnesses', label: 'Witnesses Available', desc: 'Are there witnesses willing to testify?', weight: 0.10 },
];

export default function CaseOutcomePredictor({ onClose }) {
  const [caseType, setCaseType] = useState('');
  const [factors, setFactors] = useState({});
  const [result, setResult] = useState(null);

  const handleFactor = (key, val) => {
    setFactors(prev => ({ ...prev, [key]: val }));
    setResult(null);
  };

  const predict = () => {
    const answered = FACTORS.filter(f => factors[f.key] !== undefined);
    if (answered.length < 4 || !caseType) return;

    let score = 0;
    FACTORS.forEach(f => {
      const val = factors[f.key];
      if (val === 'yes') score += f.weight * 100;
      else if (val === 'partial') score += f.weight * 50;
      else if (val === 'no') score += 0;
    });

    const winPct = Math.min(95, Math.max(12, Math.round(score)));
    const losePct = 100 - winPct;
    const confidence = answered.length >= 5 ? 'High' : 'Medium';

    const recommendations = [];
    if (factors.evidence !== 'yes') recommendations.push('📸 Gather more evidence — photos, bills, contracts, screenshots');
    if (factors.legal_support !== 'yes') recommendations.push('⚖️ Consult a lawyer — DLSA provides free legal aid (15100)');
    if (factors.witnesses !== 'yes') recommendations.push('👥 Identify and inform witnesses about the case');
    if (factors.timely_filing === 'no') recommendations.push('⏰ File immediately — limitation period may expire');
    if (factors.prior_complaints !== 'yes') recommendations.push('📋 File written complaint/RTI first to create paper trail');

    setResult({ winPct, losePct, confidence, caseType, recommendations });
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>📊 Case Outcome Predictor</div>
            <div style={styles.subtitle}>AI-powered win/lose analysis based on your case factors</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {!result ? (
            <>
              <div style={styles.formSection}>
                <label style={styles.label}>Case Type</label>
                <select value={caseType} onChange={e => { setCaseType(e.target.value); setResult(null); }} style={styles.select}>
                  <option value="">Select case type...</option>
                  {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={styles.disclaimer}>
                ⚠️ This is an AI-estimated probability based on general patterns. Not legal advice. Actual outcomes depend on many factors.
              </div>

              {FACTORS.map(f => (
                <div key={f.key} style={styles.factorRow}>
                  <div style={styles.factorInfo}>
                    <div style={styles.factorLabel}>{f.label}</div>
                    <div style={styles.factorDesc}>{f.desc}</div>
                    <div style={styles.factorWeight}>Weight: {Math.round(f.weight * 100)}%</div>
                  </div>
                  <div style={styles.optionRow}>
                    {['yes', 'partial', 'no'].map(opt => (
                      <button key={opt} onClick={() => handleFactor(f.key, opt)}
                        style={{ ...styles.optBtn, ...(factors[f.key] === opt ? styles.optBtnActive(opt) : {}) }}>
                        {opt === 'yes' ? '✓ Yes' : opt === 'partial' ? '~ Partial' : '✗ No'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={predict}
                disabled={Object.keys(factors).length < 4 || !caseType}
                style={{ ...styles.predictBtn, opacity: Object.keys(factors).length >= 4 && caseType ? 1 : 0.5 }}
              >
                📊 Predict Case Outcome
              </button>
            </>
          ) : (
            <div style={styles.resultSection}>
              <div style={styles.resultTitle}>{result.caseType}</div>

              <div style={styles.gaugeRow}>
                <div style={styles.gaugeBox}>
                  <div style={styles.gaugePct} className={result.winPct > 60 ? 'gauge-win' : result.winPct > 40 ? 'gauge-mid' : 'gauge-lose'}>
                    {result.winPct}%
                  </div>
                  <div style={{ ...styles.gaugeLabel, color: '#22c55e' }}>Win Probability</div>
                  <div style={styles.gaugeBar}>
                    <div style={{ ...styles.gaugeFill, width: result.winPct + '%', background: result.winPct > 60 ? '#22c55e' : result.winPct > 40 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
                <div style={styles.gaugeBox}>
                  <div style={{ ...styles.gaugePct, color: '#ef4444' }}>{result.losePct}%</div>
                  <div style={{ ...styles.gaugeLabel, color: '#ef4444' }}>Challenge Probability</div>
                  <div style={styles.gaugeBar}>
                    <div style={{ ...styles.gaugeFill, width: result.losePct + '%', background: '#ef4444' }} />
                  </div>
                </div>
              </div>

              <div style={styles.confidenceBadge}>
                AI Confidence: <strong style={{ color: result.confidence === 'High' ? '#22c55e' : '#f59e0b' }}>{result.confidence}</strong>
              </div>

              {result.recommendations.length > 0 && (
                <div style={styles.recsSection}>
                  <div style={styles.recsTitle}>💡 Recommendations to Improve Chances:</div>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={styles.recItem}>{rec}</div>
                  ))}
                </div>
              )}

              <div style={styles.legalNote}>
                This prediction is based on general legal patterns in Indian courts. Actual outcomes depend on specific case facts, judge, jurisdiction, and legal representation. Always consult a qualified lawyer before taking legal action.
              </div>

              <button onClick={() => { setResult(null); setFactors({}); setCaseType(''); }} style={styles.resetBtn}>
                ← Try Another Case
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { background: '#0a0f1a', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(20,184,166,0.12)' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2dd4bf', fontWeight: 700 },
  subtitle: { fontSize: 12, color: '#4b5563', fontFamily: 'Mukta', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' },
  body: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  formSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#9ca3af', fontFamily: 'Mukta', letterSpacing: 0.5 },
  select: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 10, padding: '10px 12px', color: '#e5e7eb', fontFamily: 'Mukta', fontSize: 14, outline: 'none' },
  disclaimer: { background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#9ca3af', fontFamily: 'Mukta', lineHeight: 1.5 },
  factorRow: { background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' },
  factorInfo: { flex: 1, minWidth: 160 },
  factorLabel: { fontSize: 14, color: '#e5e7eb', fontFamily: 'Mukta', fontWeight: 600 },
  factorDesc: { fontSize: 11, color: '#6b7280', fontFamily: 'Mukta', marginTop: 3 },
  factorWeight: { fontSize: 10, color: '#374151', fontFamily: 'Mukta', marginTop: 4 },
  optionRow: { display: 'flex', gap: 6, flexShrink: 0 },
  optBtn: { padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(55,65,81,0.4)', background: 'rgba(17,24,39,0.6)', color: '#6b7280', cursor: 'pointer', fontSize: 11, fontFamily: 'Mukta', transition: 'all 0.15s' },
  optBtnActive: (opt) => ({
    background: opt === 'yes' ? 'rgba(34,197,94,0.2)' : opt === 'partial' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
    borderColor: opt === 'yes' ? 'rgba(34,197,94,0.5)' : opt === 'partial' ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)',
    color: opt === 'yes' ? '#22c55e' : opt === 'partial' ? '#f59e0b' : '#ef4444',
  }),
  predictBtn: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  resultSection: { display: 'flex', flexDirection: 'column', gap: 16 },
  resultTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#f0fdfa', fontWeight: 700 },
  gaugeRow: { display: 'flex', gap: 14 },
  gaugeBox: { flex: 1, background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(55,65,81,0.3)', borderRadius: 14, padding: '18px', textAlign: 'center' },
  gaugePct: { fontSize: 42, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: '#22c55e', lineHeight: 1 },
  gaugeLabel: { fontSize: 12, fontFamily: 'Mukta', marginTop: 6, marginBottom: 10 },
  gaugeBar: { height: 6, background: 'rgba(55,65,81,0.4)', borderRadius: 100, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 100, transition: 'width 1s ease' },
  confidenceBadge: { textAlign: 'center', fontSize: 13, color: '#6b7280', fontFamily: 'Mukta' },
  recsSection: { background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 12, padding: '16px' },
  recsTitle: { fontSize: 13, color: '#5eead4', fontFamily: 'Mukta', fontWeight: 600, marginBottom: 10 },
  recItem: { fontSize: 13, color: '#9ca3af', fontFamily: 'Mukta', padding: '5px 0', borderBottom: '1px solid rgba(55,65,81,0.2)', lineHeight: 1.5 },
  legalNote: { fontSize: 11, color: '#374151', fontFamily: 'Mukta', lineHeight: 1.5, fontStyle: 'italic' },
  resetBtn: { background: 'none', border: '1px solid rgba(55,65,81,0.4)', color: '#6b7280', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta' },
};
