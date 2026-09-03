import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const URGENCY_CONFIG = {
  high: { label: '🔴 Urgent — Priority Case', style: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '3px 12px', borderRadius: 100, fontSize: 11, fontFamily: 'Mukta', display: 'inline-block', marginBottom: 6 } },
  medium: { label: '🟡 Important Case', style: { background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 12px', borderRadius: 100, fontSize: 11, fontFamily: 'Mukta', display: 'inline-block', marginBottom: 6 } },
  low: { label: '🟢 General Query', style: { background: 'rgba(20,184,166,0.15)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.3)', padding: '3px 12px', borderRadius: 100, fontSize: 11, fontFamily: 'Mukta', display: 'inline-block', marginBottom: 6 } },
};

export default function ChatMessage({ message, isLatest, onGenerateDoc, onSpeak, onShare }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAdmin = message.role === 'admin';
  const isSystemAlert = message.role === 'system_alert';

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // System alert
  if (isSystemAlert) {
    return (
      <div style={{ alignSelf: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '8px 18px', fontSize: 12, color: '#fca5a5', fontFamily: 'Mukta', textAlign: 'center', margin: '4px 0' }}>
        {message.content}
      </div>
    );
  }

  // Admin message from dashboard
  if (isAdmin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '2px 0', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👮</div>
        <div style={{ maxWidth: '80%' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.25),rgba(124,58,237,.12))', border: '1px solid rgba(124,58,237,.4)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: 14, color: '#e9d5ff', fontFamily: 'Mukta', lineHeight: 1.6 }}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>👮 Legal Officer · {formatTime(message.timestamp)}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrapper, ...(isUser ? styles.wrapperUser : styles.wrapperAI) }}>
      {!isUser && <div style={styles.avatar}>⚖️</div>}

      <div style={{ maxWidth: isUser ? '75%' : '85%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {/* Urgency Badge */}
        {!isUser && message.urgency && (
          <span style={URGENCY_CONFIG[message.urgency]?.style}>{URGENCY_CONFIG[message.urgency]?.label}</span>
        )}

        {/* Bubble */}
        <div style={{ ...styles.bubble, ...(isUser ? styles.bubbleUser : styles.bubbleAI) }}>
          {isUser ? (
            <p style={styles.userText}>{message.content}</p>
          ) : (
            <div style={styles.aiContent}>
              <ReactMarkdown components={{
                p: ({ children }) => <p style={styles.mdP}>{children}</p>,
                h1: ({ children }) => <h1 style={styles.mdH1}>{children}</h1>,
                h2: ({ children }) => <h2 style={styles.mdH2}>{children}</h2>,
                h3: ({ children }) => <h3 style={styles.mdH3}>{children}</h3>,
                ul: ({ children }) => <ul style={styles.mdUl}>{children}</ul>,
                ol: ({ children }) => <ol style={styles.mdOl}>{children}</ol>,
                li: ({ children }) => <li style={styles.mdLi}>{children}</li>,
                strong: ({ children }) => <strong style={styles.mdStrong}>{children}</strong>,
                code: ({ children }) => <code style={styles.mdCode}>{children}</code>,
                blockquote: ({ children }) => <blockquote style={styles.mdBlockquote}>{children}</blockquote>,
              }}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Legal Rights Cards — V3 Feature */}
        {!isUser && message.legalRights && message.legalRights.length > 0 && (
          <div style={styles.rightsSection}>
            <div style={styles.rightsTitle}>🔑 Your Legal Rights</div>
            <div style={styles.rightsGrid}>
              {message.legalRights.map((right, i) => (
                <div key={i} style={styles.rightCard}>
                  <span style={styles.rightIcon}>{right.icon}</span>
                  <div>
                    <div style={styles.rightName}>{right.title}</div>
                    <div style={styles.rightDesc}>{right.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IPC Sections */}
        {!isUser && message.ipcSections && message.ipcSections.length > 0 && (
          <div style={styles.ipcWrapper}>
            <span style={styles.ipcLabel}>📌 Relevant Sections:</span>
            <div style={styles.ipcChips}>
              {message.ipcSections.map((sec, i) => (
                <span key={i} style={styles.ipcChip}>{sec}</span>
              ))}
            </div>
          </div>
        )}

        {/* Document link */}
        {!isUser && message.documentLink && (
          <button onClick={() => onGenerateDoc && onGenerateDoc(message.documentLink)} style={styles.docLinkBtn}>
            📄 View Generated Document →
          </button>
        )}

        {/* Actions */}
        {!isUser && (
          <div style={styles.actions}>
            <button onClick={copyText} style={styles.actionBtn}>{copied ? '✓ Copied' : '📋 Copy'}</button>
            <button onClick={() => onSpeak && onSpeak(message.content)} style={styles.actionBtn}>🔊 Listen</button>
            <button onClick={() => onShare && onShare(message.content)} style={styles.actionBtn}>↗ Share</button>
            <button onClick={() => onGenerateDoc && onGenerateDoc('fir')} style={styles.actionBtn}>📄 Doc</button>
          </div>
        )}

        <span style={styles.timestamp}>{formatTime(message.timestamp)}</span>
      </div>

      {isUser && <div style={styles.userAvatar}>👤</div>}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', gap: 10, padding: '6px 0', alignItems: 'flex-start' },
  wrapperUser: { flexDirection: 'row-reverse' },
  wrapperAI: { flexDirection: 'row' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0f766e, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 4, border: '1px solid rgba(20,184,166,0.4)' },
  userAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'rgba(75,85,99,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 4 },
  bubble: { borderRadius: 16, padding: '12px 16px', lineHeight: 1.6 },
  bubbleUser: { background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#f0fdfa', borderBottomRightRadius: 4 },
  bubbleAI: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.15)', color: '#e5e7eb', borderBottomLeftRadius: 4 },
  userText: { fontFamily: 'Mukta', fontSize: 15, margin: 0 },
  aiContent: { fontFamily: 'Mukta' },
  // Legal Rights Cards
  rightsSection: { width: '100%', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '12px 14px' },
  rightsTitle: { fontSize: 11, color: '#fbbf24', fontFamily: 'Mukta', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  rightsGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  rightCard: { display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(17,24,39,0.4)', borderRadius: 8, padding: '8px 10px' },
  rightIcon: { fontSize: 18, flexShrink: 0 },
  rightName: { fontSize: 13, color: '#e5e7eb', fontFamily: 'Mukta', fontWeight: 600 },
  rightDesc: { fontSize: 11, color: '#6b7280', fontFamily: 'Mukta', marginTop: 2 },
  // IPC
  ipcWrapper: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  ipcLabel: { fontSize: 12, color: '#6b7280', fontFamily: 'Mukta' },
  ipcChips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  ipcChip: { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontFamily: 'Mukta', cursor: 'default' },
  docLinkBtn: { background: 'rgba(15,118,110,0.2)', border: '1px solid rgba(20,184,166,0.3)', color: '#5eead4', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta' },
  actions: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  actionBtn: { background: 'none', border: '1px solid rgba(75,85,99,0.3)', color: '#6b7280', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Mukta', transition: 'all 0.2s' },
  timestamp: { fontSize: 10, color: '#374151', fontFamily: 'Mukta' },
  mdP: { margin: '6px 0', fontSize: 14, lineHeight: 1.7 },
  mdH1: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#2dd4bf', margin: '12px 0 8px', fontWeight: 700 },
  mdH2: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#5eead4', margin: '10px 0 6px', fontWeight: 700 },
  mdH3: { fontSize: 14, color: '#5eead4', margin: '8px 0 4px', fontWeight: 600 },
  mdUl: { paddingLeft: 18, margin: '6px 0' },
  mdOl: { paddingLeft: 18, margin: '6px 0' },
  mdLi: { margin: '3px 0', fontSize: 14, lineHeight: 1.6 },
  mdStrong: { color: '#fbbf24', fontWeight: 700 },
  mdCode: { background: 'rgba(20,184,166,0.1)', color: '#5eead4', padding: '1px 6px', borderRadius: 4, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" },
  mdBlockquote: { borderLeft: '3px solid #0f766e', paddingLeft: 12, margin: '8px 0', color: '#9ca3af', fontStyle: 'italic' },
};
