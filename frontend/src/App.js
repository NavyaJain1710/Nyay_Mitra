import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ChatPage from './pages/ChatPage';
import LandingPage from './pages/LandingPage';
import DocumentsPage from './pages/DocumentsPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#134e4a',
            color: '#ccfbf1',
            border: '1px solid #0f766e',
            fontFamily: 'Mukta, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
