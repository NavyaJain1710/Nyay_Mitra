import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '⚖️', title: 'AI Legal Guidance', desc: 'Get expert legal advice in Hindi, English, and Hinglish — instantly.' },
  { icon: '📄', title: 'Document Generation', desc: 'Generate FIR, RTI, legal notices, and complaints in seconds.' },
  { icon: '🎙️', title: 'Voice Enabled', desc: 'Speak your issue — NyayMitra understands and responds in your language.' },
  { icon: '🔒', title: 'Confidential & Secure', desc: 'Your data stays private. End-to-end encrypted consultations.' },
  { icon: '🚨', title: 'Urgency Detection', desc: 'Critical cases get flagged and escalated to human legal experts.' },
  { icon: '📱', title: 'Works on 2G', desc: 'Optimized for low-bandwidth networks across rural India.' },
];

const stats = [
  { value: '50,000+', label: 'Cases Resolved' },
  { value: '12', label: 'Languages' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '24/7', label: 'Available' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('root');
    if (el) el.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚖️</span>
            <div>
              <div style={styles.logoTitle}>NyayMitra</div>
              <div style={styles.logoSub}>न्यायमित्र</div>
            </div>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#about" style={styles.navLink}>About</a>
            <a href="http://127.0.0.1:5500" target="_blank" rel="noopener noreferrer" style={styles.navLink}>Admin</a>
            <button onClick={() => navigate('/chat')} style={styles.navCta}>
              Start Chat →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🇮🇳 India's First AI Legal Assistant</div>
          <h1 style={styles.heroTitle}>
            न्याय अब<br />
            <span style={styles.heroAccent}>सबके लिए</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Get free legal guidance, generate documents, and understand your rights —
            in Hindi, Hinglish, or English. Powered by AI trained on Indian law.
          </p>
          <div style={styles.heroCtas}>
            <button onClick={() => navigate('/chat')} style={styles.ctaPrimary}>
              🎙️ Start Free Consultation
            </button>
            <button onClick={() => navigate('/documents')} style={styles.ctaSecondary}>
              📄 Generate Documents
            </button>
          </div>
          <div style={styles.heroNote}>
            No registration required • Free to use • Available 24/7
          </div>
        </div>

        {/* Chat preview mockup */}
        <div style={styles.heroChatPreview}>
          <div style={styles.chatPreviewHeader}>
            <div style={styles.chatPreviewDot} />
            <span style={{ color: '#5eead4', fontSize: 13, fontFamily: 'Mukta' }}>NyayMitra AI • Online</span>
          </div>
          {[
            { from: 'user', text: 'Mera landlord rent receipt nahi de raha, kya karu?' },
            { from: 'ai', text: 'Aap Rent Control Act ke Section 7 ke tahat receipt maang sakte hain. Main ek legal notice draft karta hoon...' },
            { from: 'ai', text: '📄 Legal Notice Generated — Ready to download' },
          ].map((m, i) => (
            <div key={i} style={{
              ...styles.previewMsg,
              alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
              background: m.from === 'user'
                ? 'linear-gradient(135deg, #0f766e, #0d9488)'
                : 'rgba(31,41,55,0.9)',
              animation: `fadeInUp 0.5s ease ${i * 0.15}s both`,
            }}>
              {m.text}
            </div>
          ))}
          <div style={styles.previewInput}>
            <span style={{ color: '#6b7280', fontSize: 13 }}>Type your legal issue...</span>
            <span style={{ fontSize: 18 }}>🎙️</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsSection}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionTag}>CAPABILITIES</div>
        <h2 style={styles.sectionTitle}>Everything You Need for Legal Help</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Areas */}
      <section id="about" style={styles.areasSection}>
        <div style={styles.sectionTag}>LEGAL DOMAINS</div>
        <h2 style={styles.sectionTitle}>We Cover All Major Legal Areas</h2>
        <div style={styles.areasList}>
          {['Criminal Law (IPC/CrPC)', 'Consumer Rights', 'Property & Land Disputes',
            'Cyber Crime', 'Labour & Employment', 'Family Law', 'RTI & PILs',
            'Domestic Violence', 'Fraud & Cheating', 'Police Complaints'].map((a, i) => (
            <div key={i} style={styles.areaChip}>{a}</div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaSectionTitle}>Ready to Know Your Rights?</h2>
        <p style={styles.ctaSectionSub}>Join thousands of Indians who got legal help — for free.</p>
        <button onClick={() => navigate('/chat')} style={{ ...styles.ctaPrimary, fontSize: 18, padding: '16px 48px' }}>
          Start Free Consultation Now →
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>⚖️ NyayMitra — न्यायमित्र</div>
        <p style={styles.footerNote}>
          NyayMitra provides AI-generated legal information for awareness purposes only.
          It is not a substitute for professional legal advice. Always consult a qualified lawyer for serious matters.
        </p>
        <p style={styles.footerCopy}>© 2024 NyayMitra. Made with ❤️ for India.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#030712', color: '#f3f4f6', overflowX: 'hidden' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 48px', transition: 'all 0.3s ease' },
  navScrolled: { background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(20,184,166,0.2)' },
  navInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 28 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#2dd4bf' },
  logoSub: { fontSize: 11, color: '#fbbf24', fontFamily: 'Mukta', letterSpacing: 2 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: { color: '#9ca3af', textDecoration: 'none', fontSize: 15, fontFamily: 'Mukta', transition: 'color 0.2s' },
  navCta: { background: 'linear-gradient(135deg, #0f766e, #d97706)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 15, fontWeight: 600 },
  hero: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '120px 8vw 80px', maxWidth: 1400, margin: '0 auto', gap: 48 },
  heroBg: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(15,118,110,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(217,119,6,0.08) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 },
  heroContent: { position: 'relative', zIndex: 1, flex: 1, maxWidth: 600 },
  heroBadge: { display: 'inline-block', background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.4)', color: '#5eead4', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontFamily: 'Mukta', marginBottom: 24 },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.1, color: '#f0fdfa', marginBottom: 20 },
  heroAccent: { background: 'linear-gradient(135deg, #2dd4bf, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSubtitle: { fontSize: 18, color: '#9ca3af', lineHeight: 1.7, fontFamily: 'Mukta', marginBottom: 36 },
  heroCtas: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 },
  ctaPrimary: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(15,118,110,0.4)' },
  ctaSecondary: { background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 12, padding: '14px 32px', cursor: 'pointer', fontFamily: 'Mukta', fontSize: 16, fontWeight: 600 },
  heroNote: { color: '#4b5563', fontSize: 13, fontFamily: 'Mukta' },
  heroChatPreview: { position: 'relative', zIndex: 1, flex: 1, maxWidth: 420, background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, backdropFilter: 'blur(12px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  chatPreviewHeader: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid rgba(20,184,166,0.15)' },
  chatPreviewDot: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' },
  previewMsg: { padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5, fontFamily: 'Mukta', maxWidth: '85%', color: '#e5e7eb' },
  previewInput: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(3,7,18,0.6)', border: '1px solid rgba(75,85,99,0.4)', borderRadius: 10, padding: '10px 14px', marginTop: 8 },
  statsSection: { display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 80px)', padding: '60px 48px', borderTop: '1px solid rgba(20,184,166,0.1)', borderBottom: '1px solid rgba(20,184,166,0.1)', background: 'rgba(19,78,74,0.05)', flexWrap: 'wrap' },
  statCard: { textAlign: 'center' },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: '#2dd4bf' },
  statLabel: { fontSize: 14, color: '#6b7280', fontFamily: 'Mukta', marginTop: 4 },
  featuresSection: { padding: '100px 8vw', maxWidth: 1300, margin: '0 auto' },
  sectionTag: { fontSize: 12, letterSpacing: 3, color: '#fbbf24', fontFamily: 'Mukta', fontWeight: 600, marginBottom: 12 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', color: '#f0fdfa', marginBottom: 56 },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  featureCard: { background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: 28, transition: 'all 0.3s ease' },
  featureIcon: { fontSize: 36, marginBottom: 16 },
  featureTitle: { fontSize: 18, fontFamily: 'Mukta', fontWeight: 600, color: '#e5e7eb', marginBottom: 10 },
  featureDesc: { fontSize: 14, color: '#6b7280', fontFamily: 'Mukta', lineHeight: 1.6 },
  areasSection: { padding: '80px 8vw', background: 'rgba(19,78,74,0.05)', borderTop: '1px solid rgba(20,184,166,0.1)' },
  areasList: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  areaChip: { background: 'rgba(15,118,110,0.2)', border: '1px solid rgba(20,184,166,0.3)', color: '#5eead4', padding: '8px 20px', borderRadius: 100, fontSize: 14, fontFamily: 'Mukta' },
  ctaSection: { textAlign: 'center', padding: '100px 48px', borderTop: '1px solid rgba(20,184,166,0.1)' },
  ctaSectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 40, color: '#f0fdfa', marginBottom: 16 },
  ctaSectionSub: { color: '#9ca3af', fontSize: 18, fontFamily: 'Mukta', marginBottom: 40 },
  footer: { borderTop: '1px solid rgba(20,184,166,0.1)', padding: '48px', textAlign: 'center' },
  footerLogo: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2dd4bf', marginBottom: 16 },
  footerNote: { color: '#4b5563', fontSize: 13, fontFamily: 'Mukta', maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.6 },
  footerCopy: { color: '#374151', fontSize: 13, fontFamily: 'Mukta' },
};
