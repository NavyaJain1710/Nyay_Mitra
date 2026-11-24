import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function VoiceButton({ onTranscript, language, speechCode }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechCode || (language === 'english' ? 'en-IN' : 'hi-IN');

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }
        const full = (final + interim).trim();
        if (full) {
          accumulatedRef.current = full;
          onTranscript(full);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.');
        } else if (e.error === 'network') {
          toast.error('Speech recognition network error.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, speechCode, onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      toast.error('Voice input is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
      setIsListening(false);
    } else {
      accumulatedRef.current = '';
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast('Listening... Speak your legal problem', { icon: '🎙️' });
      } catch (err) {
        console.warn('Speech recognition already started or failed to start:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      style={{
        ...styles.btn,
        ...(isListening ? styles.btnActive : {}),
        opacity: supported ? 1 : 0.6,
      }}
      title={isListening ? 'Click to stop listening' : 'Speak your legal issue (Voice Input)'}
    >
      {isListening ? <span style={styles.recordingDot} /> : '🎙️'}
    </button>
  );
}

const styles = {
  btn: {
    background: 'rgba(15,118,110,0.2)',
    border: '1px solid rgba(20,184,166,0.3)',
    borderRadius: 8,
    width: 36,
    height: 36,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  btnActive: {
    background: 'rgba(239,68,68,0.25)',
    borderColor: 'rgba(239,68,68,0.6)',
    boxShadow: '0 0 10px rgba(239,68,68,0.3)',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#ef4444',
    animation: 'pulse-soft 1s infinite',
  },
};
