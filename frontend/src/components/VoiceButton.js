import React, { useState, useRef, useEffect } from 'react';

export default function VoiceButton({ onTranscript, language, speechCode }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechCode || (language === 'english' ? 'en-IN' : 'hi-IN');

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        if (event.results[0].isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language, speechCode, onTranscript]);

  const toggleListening = () => {
    if (!supported) { alert('Voice input not supported. Please use Chrome.'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { recognitionRef.current?.start(); setIsListening(true); }
  };

  return (
    <button onClick={toggleListening}
      style={{ ...styles.btn, ...(isListening ? styles.btnActive : {}), opacity: supported ? 1 : 0.5 }}
      title={isListening ? 'Stop recording' : 'Speak your legal issue'}>
      {isListening ? <span style={styles.recordingDot} /> : '🎙️'}
    </button>
  );
}

const styles = {
  btn: { background: 'rgba(15,118,110,0.2)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  btnActive: { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.5)', animation: 'glow 1.5s infinite' },
  recordingDot: { width: 12, height: 12, borderRadius: '50%', background: '#ef4444', animation: 'pulse-soft 1s infinite' },
};
