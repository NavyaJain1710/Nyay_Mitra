import React, { useState } from 'react';

const TIMELINES = {
  fir_to_conviction: {
    label: 'FIR → Conviction (Criminal)',
    icon: '🚔',
    steps: [
      { step: 1, title: 'FIR Registration', desc: 'File FIR at police station. Zero FIR allowed at any station.', time: 'Day 1', law: 'CrPC 154', color: '#ef4444' },
      { step: 2, title: 'Police Investigation', desc: 'Police collects evidence, records statements, visits crime scene.', time: '1-90 days', law: 'CrPC 156', color: '#f59e0b' },
      { step: 3, title: 'Chargesheet Filed', desc: 'Police files chargesheet within 60/90 days (else bail).', time: '60-90 days', law: 'CrPC 173', color: '#f59e0b' },
      { step: 4, title: 'Cognizance by Court', desc: 'Magistrate takes cognizance of chargesheet.', time: '+1-2 weeks', law: 'CrPC 190', color: '#14b8a6' },
      { step: 5, title: 'Bail / Remand', desc: 'Accused gets bail or remanded to custody.', time: 'Same day / within 24hrs', law: 'CrPC 437-439', color: '#14b8a6' },
      { step: 6, title: 'Framing of Charges', desc: 'Court reads charges to accused, enters plea.', time: '1-6 months', law: 'CrPC 228', color: '#8b5cf6' },
      { step: 7, title: 'Trial (Prosecution Evidence)', desc: 'Prosecution presents witnesses and evidence.', time: '6 months - 2 years', law: 'CrPC 231', color: '#8b5cf6' },
      { step: 8, title: 'Defense Evidence', desc: 'Defense presents its case.', time: '+3-12 months', law: 'CrPC 233', color: '#3b82f6' },
      { step: 9, title: 'Arguments', desc: 'Both sides present final arguments.', time: '+1-3 months', law: 'CrPC 234', color: '#3b82f6' },
      { step: 10, title: 'Judgment / Conviction', desc: 'Court delivers judgment. Acquittal or conviction.', time: 'Total: 1-5+ years', law: 'CrPC 235', color: '#22c55e' },
    ],
  },
  property_dispute: {
    label: 'Property Dispute',
    icon: '🏠',
    steps: [
      { step: 1, title: 'Legal Notice to Opponent', desc: 'Send formal legal notice demanding resolution.', time: 'Week 1', law: 'CPC Section 80', color: '#f59e0b' },
      { step: 2, title: 'Wait for Response', desc: 'Opponent has 30-60 days to respond.', time: '30-60 days', law: 'CPC 80', color: '#f59e0b' },
      { step: 3, title: 'File Civil Suit', desc: 'File suit for title declaration or injunction.', time: 'Day 1 of Court', law: 'CPC Order 7', color: '#ef4444' },
      { step: 4, title: 'Interim Injunction', desc: 'Apply for stay order to stop construction/encroachment.', time: '1-2 weeks', law: 'CPC Order 39', color: '#14b8a6' },
      { step: 5, title: 'Written Statement by Defendant', desc: 'Opposite party files reply within 30 days.', time: '30 days', law: 'CPC Order 8', color: '#14b8a6' },
      { step: 6, title: 'Issues Framed', desc: 'Court frames issues to be decided.', time: '1-3 months', law: 'CPC Order 14', color: '#8b5cf6' },
      { step: 7, title: 'Evidence & Documents', desc: 'Both parties submit evidence and documents.', time: '6-18 months', law: 'CPC Order 18', color: '#8b5cf6' },
      { step: 8, title: 'Arguments', desc: 'Final arguments by both lawyers.', time: '+3-6 months', law: 'CPC Order 18', color: '#3b82f6' },
      { step: 9, title: 'Decree Passed', desc: 'Court passes decree. May be appealed.', time: 'Total: 2-7 years', law: 'CPC Section 33', color: '#22c55e' },
    ],
  },
  labour_dispute: {
    label: 'Labour / Wrongful Termination',
    icon: '👔',
    steps: [
      { step: 1, title: 'Receive Termination Letter', desc: 'Document date, reason, and ensure F&F settlement demand.', time: 'Day of termination', law: 'IDA Sec 25F', color: '#ef4444' },
      { step: 2, title: 'Send Legal Notice', desc: 'Advocate sends legal notice to employer within 30 days.', time: 'Within 30 days', law: 'IDA Sec 25F', color: '#f59e0b' },
      { step: 3, title: 'Conciliation with Labour Dept', desc: 'Conciliation Officer tries to settle the dispute.', time: '30-45 days', law: 'IDA Sec 12', color: '#14b8a6' },
      { step: 4, title: 'Labour Court Filing', desc: 'File Industrial Dispute if conciliation fails.', time: '3 years from termination', law: 'IDA Sec 10', color: '#8b5cf6' },
      { step: 5, title: 'Trial & Evidence', desc: 'Documents, witnesses, pay slips presented.', time: '6-18 months', law: 'IDA Sec 11', color: '#8b5cf6' },
      { step: 6, title: 'Award by Labour Court', desc: 'Award for reinstatement or compensation.', time: 'Total: 1-3 years', law: 'IDA Sec 11A', color: '#22c55e' },
    ],
  },
  rti: {
    label: 'RTI Application Process',
    icon: '📋',
    steps: [
      { step: 1, title: 'File RTI Application', desc: 'Submit to PIO with ₹10 fee. Online: rtionline.gov.in', time: 'Day 1', law: 'RTI Act Sec 6', color: '#14b8a6' },
      { step: 2, title: 'Receipt Acknowledgment', desc: 'PIO acknowledges receipt.', time: 'Within 5 days', law: 'RTI Act Sec 7', color: '#14b8a6' },
      { step: 3, title: 'Information Provided (or Denied)', desc: '30 days mandatory. Life/liberty: 48 hours.', time: '30 days', law: 'RTI Act Sec 7', color: '#f59e0b' },
      { step: 4, title: 'First Appeal (if unsatisfied)', desc: 'Appeal to First Appellate Authority within 30 days.', time: '30 days from reply', law: 'RTI Act Sec 19(1)', color: '#f59e0b' },
      { step: 5, title: 'First Appeal Decision', desc: 'FAA decides within 30 days (max 45).', time: '30-45 days', law: 'RTI Act Sec 19(6)', color: '#8b5cf6' },
      { step: 6, title: 'Second Appeal / Complaint', desc: 'Appeal to State/Central Information Commission.', time: '90 days', law: 'RTI Act Sec 19(3)', color: '#3b82f6' },
      { step: 7, title: 'Commission Order', desc: 'Commission can impose penalty up to ₹25,000.', time: 'Total: 3-18 months', law: 'RTI Act Sec 20', color: '#22c55e' },
    ],
  },
};

export default function LegalTimeline({ onClose }) {
  const [activeTimeline, setActiveTimeline] = useState('fir_to_conviction');
  const timeline = TIMELINES[activeTimeline];

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>📅 Legal Process Timeline</div>
            <div style={styles.subtitle}>Step-by-step guide for major legal processes in India</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.tabRow}>
          {Object.entries(TIMELINES).map(([key, tl]) => (
            <button key={key} onClick={() => setActiveTimeline(key)}
              style={{ ...styles.tab, ...(activeTimeline === key ? styles.tabActive : {}) }}>
              {tl.icon} {tl.label}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          {timeline.steps.map((step, i) => (
            <div key={step.step} style={styles.stepRow}>
              <div style={styles.stepLeft}>
                <div style={{ ...styles.stepDot, borderColor: step.color, background: step.color + '33' }}>
                  <span style={{ color: step.color, fontSize: 12, fontWeight: 700 }}>{step.step}</span>
                </div>
                {i < timeline.steps.length - 1 && <div style={{ ...styles.stepLine, borderColor: step.color + '40' }} />}
              </div>
              <div style={styles.stepContent}>
                <div style={styles.stepTitle}>{step.title}</div>
                <div style={styles.stepDesc}>{step.desc}</div>
                <div style={styles.stepMeta}>
                  <span style={styles.stepTime}>⏱ {step.time}</span>
                  <span style={{ ...styles.stepLaw, borderColor: step.color + '40', color: step.color }}>{step.law}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { background: '#0a0f1a', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(20,184,166,0.12)' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2dd4bf', fontWeight: 700 },
  subtitle: { fontSize: 12, color: '#4b5563', fontFamily: 'Mukta', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' },
  tabRow: { display: 'flex', gap: 0, padding: '12px 24px', borderBottom: '1px solid rgba(20,184,166,0.08)', flexWrap: 'wrap', gap: 8 },
  tab: { background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(55,65,81,0.4)', color: '#6b7280', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta', whiteSpace: 'nowrap' },
  tabActive: { background: 'rgba(20,184,166,0.2)', borderColor: 'rgba(20,184,166,0.4)', color: '#5eead4' },
  body: { flex: 1, overflowY: 'auto', padding: '24px 28px' },
  stepRow: { display: 'flex', gap: 16, position: 'relative', marginBottom: 0 },
  stepLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 },
  stepDot: { width: 36, height: 36, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, background: 'rgba(3,7,18,0.8)' },
  stepLine: { width: 2, flex: 1, minHeight: 32, borderLeft: '2px dashed', margin: '4px 0' },
  stepContent: { flex: 1, paddingBottom: 24 },
  stepTitle: { fontFamily: 'Mukta', fontSize: 15, color: '#e5e7eb', fontWeight: 600, marginBottom: 4 },
  stepDesc: { fontFamily: 'Mukta', fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 8 },
  stepMeta: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  stepTime: { fontSize: 11, color: '#9ca3af', fontFamily: 'Mukta', background: 'rgba(55,65,81,0.3)', padding: '2px 10px', borderRadius: 100 },
  stepLaw: { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", border: '1px solid', padding: '2px 10px', borderRadius: 100 },
};
