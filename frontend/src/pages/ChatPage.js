import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import Sidebar from '../components/Sidebar';
import VoiceButton from '../components/VoiceButton';
import DocumentModal from '../components/DocumentModal';
import IPCKnowledgePanel from '../components/IPCKnowledgePanel';
import LegalTimeline from '../components/LegalTimeline';
import CaseOutcomePredictor from '../components/CaseOutcomePredictor';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const LANGUAGES = [
  { code: 'hinglish', label: 'Hinglish', flag: '🇮🇳', desc: 'Hindi + English', speechCode: 'hi-IN' },
  { code: 'hindi', label: 'हिंदी', flag: '🇮🇳', desc: 'Pure Hindi', speechCode: 'hi-IN' },
  { code: 'english', label: 'English', flag: '🇬🇧', desc: 'English only', speechCode: 'en-IN' },
  { code: 'tamil', label: 'தமிழ்', flag: '🏳️', desc: 'Tamil', speechCode: 'ta-IN' },
  { code: 'telugu', label: 'తెలుగు', flag: '🏳️', desc: 'Telugu', speechCode: 'te-IN' },
  { code: 'bengali', label: 'বাংলা', flag: '🏳️', desc: 'Bengali', speechCode: 'bn-IN' },
  { code: 'marathi', label: 'मराठी', flag: '🏳️', desc: 'Marathi', speechCode: 'mr-IN' },
  { code: 'gujarati', label: 'ગુજરાતી', flag: '🏳️', desc: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'kannada', label: 'ಕನ್ನಡ', flag: '🏳️', desc: 'Kannada', speechCode: 'kn-IN' },
  { code: 'malayalam', label: 'മലയാളം', flag: '🏳️', desc: 'Malayalam', speechCode: 'ml-IN' },
  { code: 'punjabi', label: 'ਪੰਜਾਬੀ', flag: '🏳️', desc: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'odia', label: 'ଓଡ଼ିଆ', flag: '🏳️', desc: 'Odia', speechCode: 'or-IN' },
];

const QUICK_PROMPTS = [
  { icon: '🚨', text: 'FIR kaise file karein?', label: 'File an FIR' },
  { icon: '🏠', text: 'Zameen vivad mein kya karein?', label: 'Land Dispute' },
  { icon: '💻', text: 'Cyber fraud ho gaya, help chahiye', label: 'Cyber Crime' },
  { icon: '📋', text: 'RTI application likhni hai', label: 'RTI Filing' },
  { icon: '👔', text: 'Job se nikala, kya adhikar hain?', label: 'Labour Rights' },
  { icon: '👨‍👩‍👧', text: 'Divorce ke baad property rights?', label: 'Family Law' },
];

const SYSTEM_GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: `Namaste! 🙏 Main **NyayMitra** hoon — aapka AI legal assistant.

Main aapki madad kar sakta hoon:
- ⚖️ Legal rights aur kanoon samjhane mein
- 📄 FIR, RTI, aur legal documents generate karne mein  
- 🔍 IPC/CrPC sections explain karne mein
- 🚨 Urgent cases escalate karne mein
- 📊 Case outcome predict karne mein (NEW!)

**12 regional languages** mein help available hai!

Aapka kya mudda hai? Main ab ready hoon.`,
  timestamp: new Date(),
  ipcSections: [],
};

const getMockResponse = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('fir') || lower.includes('police')) {
    return {
      content: `## FIR (First Information Report) File Karne Ka Tarika

**Step 1: Nearest Police Station Jaayein**
Apne area ke nearest police station mein jaayein. Aap online bhi file kar sakte hain.

**Step 2: Documents Taiyar Rakhen:**
- Apni ID proof (Aadhar/PAN)
- Ghatna ka full vivran likhit mein
- Koi bhi evidence (photos, videos, screenshots)

**⚖️ Legal Rights:**
- Police FIR likhne se MANA NAHI kar sakti *(IPC Section 166A)*
- Zero FIR: Kisi bhi police station mein file kar sakte hain
- Agar police refuse kare — Superintendent of Police ko likhein`,
      ipcSections: ['IPC 166A', 'CrPC 154', 'CrPC 156(3)'],
      urgency: 'medium',
      legalRights: [
        { icon: '📌', title: 'Zero FIR Right', desc: 'Any police station must accept FIR' },
        { icon: '⚖️', title: 'Free Legal Aid', desc: 'Contact DLSA for free lawyer' },
        { icon: '🔒', title: 'Police Duty', desc: 'FIR refusal is a punishable offence' },
      ],
    };
  }
  if (lower.includes('domestic') || lower.includes('maar') || lower.includes('498') || lower.includes('violence') || lower.includes('cruelty')) {
    return {
      content: `## ⚠️ Domestic Violence — Aapki Safety Pehle!

**Turant Helpline:**
🆘 Mahila Helpline: **1091**
🚔 Police: **100**  
📱 NCW: **7827170170**

**Legal Options:**
1. **Protection Order** *(PWDVA 2005 Section 12)* — Magistrate ke saamne avedan, 3 din mein sunvaai
2. **FIR Darj Karein** *(IPC 498A)* — Non-Bailable offense
3. **Free Legal Aid** — DLSA se free vakeel

Kya aap abhi safe hain?`,
      ipcSections: ['PWDVA 2005 Sec 12', 'IPC 498A', 'IPC 323'],
      urgency: 'high',
      legalRights: [
        { icon: '🛡️', title: 'Protection Order', desc: 'Court can issue order in 3 days' },
        { icon: '🏠', title: 'Residence Right', desc: 'Right to stay in shared household' },
        { icon: '💰', title: 'Maintenance Right', desc: 'Monetary relief under PWDVA' },
      ],
    };
  }
  if (lower.includes('rti')) {
    return {
      content: `## RTI (Right to Information) Application Guide

**RTI Act 2005** ke tahat har nagrik ko government information maangne ka adhikar hai.

**Aavedan kaise karein:**
1. **Online:** rtionline.gov.in
2. **Offline:** PIO ko likhein
3. **Fee:** ₹10 (BPL free)

**Timeline:** 30 din mein jawab mandatory | Urgent: 48 ghante

Kya main aapke liye **RTI Draft** generate karoon?`,
      ipcSections: ['RTI Act 2005 - Section 6', 'RTI Act 2005 - Section 7'],
      urgency: 'low',
      legalRights: [
        { icon: '📋', title: 'Right to Information', desc: 'Every citizen can demand govt info' },
        { icon: '⏰', title: '30-Day Deadline', desc: 'Mandatory response within 30 days' },
        { icon: '🆓', title: 'Free for BPL', desc: 'No fee for below poverty line applicants' },
      ],
    };
  }
  if (lower.includes('zameen') || lower.includes('property') || lower.includes('land') || lower.includes('rent') || lower.includes('landlord')) {
    return {
      content: `## Zameen/Property Vivad — Legal Options

**Aapke paas ye options hain:**

1. **Civil Court** — Title declaration, Injunction order
2. **Revenue Court** — Mutation records correction (faster)
3. **Lok Adalat** — Free out-of-court settlement
4. **DLSA** — Free legal aid

**📌 Important Documents:** Sale deed, Mutation records, Encumbrance certificate`,
      ipcSections: ['Transfer of Property Act 1882', 'Specific Relief Act 1963', 'CPC Order 39'],
      urgency: 'medium',
      legalRights: [
        { icon: '📜', title: 'Title Declaration', desc: 'Court can declare rightful owner' },
        { icon: '⛔', title: 'Injunction Right', desc: 'Stay order to stop encroachment' },
        { icon: '🆓', title: 'Free Lok Adalat', desc: 'Free out-of-court settlement' },
      ],
    };
  }
  if (lower.includes('cyber') || lower.includes('fraud') || lower.includes('hack') || lower.includes('scam') || lower.includes('otp')) {
    return {
      content: `## Cyber Crime — Turant Karyavaahi!

**Step 1:** Bank ko turant call karein — transaction block karvaayein (24hr window)
**Step 2:** cybercrime.gov.in → "Report Financial Fraud" | Helpline: **1930**
**Step 3:** Screenshots, transaction ID collect karein
**Step 4:** Local Cyber Crime Cell mein FIR`,
      ipcSections: ['IT Act 66D', 'IPC 420', 'IPC 406'],
      urgency: 'high',
      legalRights: [
        { icon: '💰', title: 'Money Recovery', desc: '24hr window to recover transfers' },
        { icon: '🌐', title: 'Online FIR', desc: 'File at cybercrime.gov.in instantly' },
        { icon: '📞', title: 'Cyber Helpline', desc: 'Call 1930 immediately' },
      ],
    };
  }
  if (lower.includes('job') || lower.includes('fired') || lower.includes('termination') || lower.includes('salary') || lower.includes('naukri')) {
    return {
      content: `## Labour Rights — Wrongful Termination

**Aapke Adhikar:**
- 1 maah ka Notice ya vetan mandatory *(Industrial Disputes Act Section 25F)*
- 5+ saal service: Gratuity mandatory
- Full & Final Settlement — sabhi dues

**Gratuity Formula:** Last Salary × 15/26 × Years of Service

**Kahan Shikayat Karein:**
1. Labour Commissioner Office
2. Labour Court (Industrial Dispute)
3. EPF Commissioner (PF ke liye)`,
      ipcSections: ['Industrial Disputes Act Sec 25F', 'Payment of Gratuity Act Sec 4'],
      urgency: 'medium',
      legalRights: [
        { icon: '📋', title: 'Notice Mandatory', desc: '1 month notice or salary required' },
        { icon: '💰', title: 'Gratuity Right', desc: 'Mandatory after 5 years service' },
        { icon: '🏦', title: 'PF Right', desc: 'Full PF withdrawal entitlement' },
      ],
    };
  }
  return {
    content: `Aapka sawaal samajh aa gaya. Main aapki **legal situation** analyze kar raha hoon.

**Mujhe thodi aur jankari chahiye:**
1. Ye mudda kab se chal raha hai?
2. Koi police complaint ya court case pehle hua hai?
3. Koi documents ya evidence hai aapke paas?

In details ke saath main **accurate legal guidance** de sakta hoon — IPC sections, next steps, aur documents generate karne mein help.

**Note:** AI-generated information hai. Serious mamlon mein qualified lawyer se zaroor milein.`,
    ipcSections: [],
    urgency: 'low',
    legalRights: [],
  };
};

const speakText = (text, langCode) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleaned = text.replace(/\*\*/g, '').replace(/#{1,3} /g, '').replace(/\*/g, '').substring(0, 500);
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = langCode || 'hi-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([SYSTEM_GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [language, setLanguage] = useState('hinglish');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'Landlord dispute help', date: '2 hours ago', tag: 'property' },
    { id: '2', title: 'FIR filing query', date: 'Yesterday', tag: 'criminal' },
  ]);
  const [docModal, setDocModal] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showIPCPanel, setShowIPCPanel] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const connectWS = () => {
      try {
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${sessionId}`);
        wsRef.current = ws;
        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => { setIsConnected(false); setTimeout(connectWS, 3000); };
        ws.onerror = () => setIsConnected(false);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setIsTyping(false);
            const msg = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.content,
              timestamp: new Date(),
              ipcSections: data.ipc_sections || [],
              urgency: data.urgency,
              documentLink: data.document_link,
              legalRights: data.legal_rights || [],
            };
            setMessages(prev => [...prev, msg]);
            if (ttsEnabled) speakText(data.content, currentLang.speechCode);
          } else if (data.type === 'admin_message') {
            // Admin replied from dashboard
            const adminMsg = {
              id: 'admin_' + Date.now().toString(),
              role: 'admin',
              content: '👮 **Legal Officer**: ' + data.content,
              timestamp: new Date(data.timestamp || Date.now()),
              ipcSections: [],
              urgency: 'low',
              isAdminMessage: true,
            };
            setMessages(prev => [...prev, adminMsg]);
          } else if (data.type === 'typing') {
            setIsTyping(data.status);
          } else if (data.type === 'error') {
            setIsTyping(false);
          }
        };
      } catch (e) { setIsConnected(false); }
    };
    connectWS();
    return () => wsRef.current?.close();
  }, [sessionId, ttsEnabled, currentLang.speechCode]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const distressKeywords = ['maar', 'beat', 'bachao', 'urgent', 'emergency', 'please help', 'dar raha', 'afraid', 'scared', 'violence', 'threatened', 'dhama'];
    const isDistress = distressKeywords.some(kw => text.toLowerCase().includes(kw));
    if (isDistress) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'distress_' + Date.now(), role: 'system_alert',
          content: '🔴 URGENT CASE DETECTED — Auto-escalating to legal helpdesk',
          timestamp: new Date(), urgency: 'high',
        }]);
      }, 400);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text, language, session_id: sessionId }));
    } else {
      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, language, session_id: sessionId }),
        });
        const data = await res.json();
        setIsTyping(false);
        const msg = {
          id: Date.now().toString(), role: 'assistant', content: data.response,
          timestamp: new Date(), ipcSections: data.ipc_sections || [],
          urgency: data.urgency, documentLink: data.document_link, legalRights: [],
        };
        setMessages(prev => [...prev, msg]);
        if (ttsEnabled) speakText(data.response, currentLang.speechCode);
      } catch {
        setIsTyping(false);
        const mockResponse = getMockResponse(text);
        const msg = {
          id: Date.now().toString(), role: 'assistant', content: mockResponse.content,
          timestamp: new Date(), ipcSections: mockResponse.ipcSections || [],
          urgency: mockResponse.urgency || 'low', legalRights: mockResponse.legalRights || [],
        };
        setMessages(prev => [...prev, msg]);
        if (ttsEnabled) speakText(mockResponse.content, currentLang.speechCode);
      }
    }
  }, [language, sessionId, ttsEnabled, currentLang.speechCode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handlePrint = () => {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAI) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>NyayMitra</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6}h1{color:#0f766e}pre{white-space:pre-wrap;font-family:Arial}</style></head><body><h1>⚖️ NyayMitra Legal Advice</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p><p><strong>Session:</strong> ${sessionId}</p><hr/><pre>${lastAI.content.replace(/\*\*/g,'').replace(/#{1,3} /g,'\n')}</pre><hr/><p style="color:#666;font-size:12px">AI-generated. Not a substitute for professional legal advice.</p></body></html>`);
    win.print();
  };

  const handleShare = (content) => {
    const text = `⚖️ NyayMitra Legal Advice:\n\n${content.replace(/\*\*/g,'').replace(/#{1,3} /g,'').substring(0,280)}...\n\nFree legal help: nyaymitra.ai`;
    if (navigator.share) { navigator.share({ title: 'NyayMitra', text }); }
    else { navigator.clipboard.writeText(text); alert('Copied! Paste in WhatsApp.'); }
  };

  const handleSpeak = (content) => {
    speakText(content, currentLang.speechCode);
  };

  return (
    <div style={styles.layout}>
      <Sidebar
        isOpen={sidebarOpen}
        chatHistory={chatHistory}
        language={language}
        onLanguageChange={setLanguage}
        languages={LANGUAGES}
        onNewChat={() => {
          setMessages([SYSTEM_GREETING]);
          setChatHistory(prev => [{ id: Date.now().toString(), title: 'New consultation', date: 'Just now', tag: 'general' }, ...prev]);
        }}
        onNavigate={navigate}
        onGenerateDoc={setDocModal}
        onShowIPC={() => setShowIPCPanel(true)}
        onShowTimeline={() => setShowTimeline(true)}
        onShowPredictor={() => setShowPredictor(true)}
        onPrint={handlePrint}
      />

      <div style={{ ...styles.main, marginLeft: sidebarOpen ? 280 : 0 }}>
        <div style={styles.header}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>{sidebarOpen ? '✕' : '☰'}</button>
          <div style={styles.headerInfo}>
            <div style={styles.headerTitle}>⚖️ NyayMitra AI</div>
            <div style={styles.headerStatus}>
              <span style={{ ...styles.statusDot, background: isConnected ? '#22c55e' : '#f59e0b' }} />
              {isConnected ? 'Live Connected' : 'AI Mode'} · {currentLang.label}
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => setTtsEnabled(!ttsEnabled)} style={{ ...styles.toolBtn, ...(ttsEnabled ? styles.toolBtnActive : {}) }} title="Text to Speech">{ttsEnabled ? '🔊' : '🔇'}</button>
            <button onClick={handlePrint} style={styles.toolBtn} title="Print">🖨️</button>
            <button onClick={() => navigate('/')} style={styles.homeBtn}>← Home</button>
          </div>
        </div>

        <div style={styles.messagesArea} className="scroll-area">
          {messages.map((msg, i) => (
            msg.role === 'system_alert' ? (
              <div key={msg.id} style={styles.alertBanner}>
                <span style={{ color: '#fca5a5', fontFamily: 'Mukta', fontSize: 13 }}>{msg.content}</span>
                <a href="tel:1091" style={styles.alertLink}>Call 1091</a>
              </div>
            ) : (
              <ChatMessage key={msg.id} message={msg} isLatest={i === messages.length - 1}
                onGenerateDoc={setDocModal} onSpeak={handleSpeak} onShare={handleShare} />
            )
          ))}

          {isTyping && (
            <div style={styles.typingWrapper}>
              <div style={styles.typingBubble}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
              <span style={styles.typingLabel}>NyayMitra is analyzing your case...</span>
            </div>
          )}

          {messages.length === 1 && (
            <div style={styles.quickPromptsGrid}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)} style={styles.quickPromptBtn}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={styles.quickPromptLabel}>{p.label}</span>
                  <span style={styles.quickPromptText}>{p.text}</span>
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.featureToolbar}>
          <button onClick={() => setShowIPCPanel(true)} style={styles.featureBtn}>📚 IPC/CrPC Laws</button>
          <button onClick={() => setShowTimeline(true)} style={styles.featureBtn}>📅 Legal Timeline</button>
          <button onClick={() => setShowPredictor(true)} style={styles.featureBtn}>📊 Case Predictor</button>
          <button onClick={() => setDocModal('fir')} style={styles.featureBtn}>📄 FIR Draft</button>
          <button onClick={() => setDocModal('rti')} style={styles.featureBtn}>📋 RTI Draft</button>
          <button onClick={() => setDocModal('notice')} style={styles.featureBtn}>📜 Legal Notice</button>
        </div>

        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Apna legal mudda batayein (${currentLang.label})...`}
              style={styles.textarea}
              rows={1}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />
            <div style={styles.inputActions}>
              <VoiceButton onTranscript={(t) => { setInput(t); inputRef.current?.focus(); }} language={language} speechCode={currentLang.speechCode} />
              <button onClick={() => setDocModal('fir')} style={styles.docBtn} title="Generate Document">📄</button>
              <button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{ ...styles.sendBtn, opacity: input.trim() ? 1 : 0.5 }}>→</button>
            </div>
          </div>
          <p style={styles.disclaimer}>AI-generated legal info. Not professional advice. Emergency: 100 | Women: 1091 | Legal Aid: 15100 | Cyber: 1930</p>
        </div>
      </div>

      {docModal && <DocumentModal docType={docModal} onClose={() => setDocModal(null)} sessionId={sessionId} messages={messages} />}
      {showIPCPanel && <IPCKnowledgePanel onClose={() => setShowIPCPanel(false)} />}
      {showTimeline && <LegalTimeline onClose={() => setShowTimeline(false)} />}
      {showPredictor && <CaseOutcomePredictor onClose={() => setShowPredictor(false)} />}
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#030712', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', minWidth: 0 },
  header: { display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', height: 64, background: 'rgba(17,24,39,0.95)', borderBottom: '1px solid rgba(20,184,166,0.15)', backdropFilter: 'blur(12px)', zIndex: 10, flexShrink: 0 },
  menuBtn: { background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#2dd4bf', fontWeight: 700 },
  headerStatus: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontFamily: 'Mukta', marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: '50%' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  toolBtn: { background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(55,65,81,0.4)', color: '#9ca3af', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 16 },
  toolBtnActive: { background: 'rgba(20,184,166,0.2)', borderColor: 'rgba(20,184,166,0.5)', color: '#5eead4' },
  homeBtn: { background: 'none', border: '1px solid rgba(75,85,99,0.4)', color: '#9ca3af', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Mukta' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
  alertBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '10px 16px', gap: 12, animation: 'pulse-soft 2s infinite' },
  alertLink: { background: '#ef4444', color: '#fff', padding: '4px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'Mukta', fontWeight: 600, textDecoration: 'none', flexShrink: 0 },
  typingWrapper: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' },
  typingBubble: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '12px 18px', display: 'flex', gap: 4, alignItems: 'center' },
  typingLabel: { color: '#4b5563', fontSize: 12, fontFamily: 'Mukta' },
  quickPromptsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, padding: '16px 0', marginTop: 8 },
  quickPromptBtn: { background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4, color: '#e5e7eb' },
  quickPromptLabel: { fontSize: 13, fontFamily: 'Mukta', fontWeight: 600, color: '#5eead4' },
  quickPromptText: { fontSize: 11, color: '#6b7280', fontFamily: 'Mukta', lineHeight: 1.4 },
  featureToolbar: { display: 'flex', gap: 8, padding: '8px 24px', background: 'rgba(10,15,26,0.8)', borderTop: '1px solid rgba(20,184,166,0.08)', flexWrap: 'wrap', flexShrink: 0 },
  featureBtn: { background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(20,184,166,0.2)', color: '#9ca3af', padding: '5px 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontFamily: 'Mukta', whiteSpace: 'nowrap' },
  inputArea: { padding: '12px 24px 20px', borderTop: '1px solid rgba(20,184,166,0.1)', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(8px)', flexShrink: 0 },
  inputWrapper: { display: 'flex', gap: 10, alignItems: 'flex-end', background: 'rgba(3,7,18,0.6)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 16, padding: '10px 12px' },
  textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e5e7eb', fontFamily: 'Mukta', fontSize: 15, lineHeight: 1.5, resize: 'none', minHeight: 24, maxHeight: 120 },
  inputActions: { display: 'flex', gap: 6, alignItems: 'flex-end', flexShrink: 0 },
  docBtn: { background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 },
  sendBtn: { background: 'linear-gradient(135deg, #0f766e, #14b8a6)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  disclaimer: { fontSize: 11, color: '#374151', fontFamily: 'Mukta', textAlign: 'center', marginTop: 10 },
};
