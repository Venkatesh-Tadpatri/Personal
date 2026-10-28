import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onReady }) {
  const [status, setStatus] = useState('Connecting to server...');
  const [dots, setDots] = useState('');
  const [attempt, setAttempt] = useState(0);

  // Animate dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  // Poll server until ready
  useEffect(() => {
    let tries = 0;
    const maxTries = 20;

    const check = async () => {
      tries++;
      try {
        const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setStatus('Connected! Loading app...');
          setTimeout(onReady, 600);
          return;
        }
      } catch {
        // not ready yet
      }

      if (tries < maxTries) {
        setStatus(`Starting server (attempt ${tries}/${maxTries})`);
        setAttempt(tries);
        setTimeout(check, 1000);
      } else {
        setStatus('Server timeout — check if port 5000 is free');
      }
    };

    setTimeout(check, 800);
  }, [onReady]);

  const pct = Math.min((attempt / 20) * 100, 95);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      background: 'var(--bg-deep)', color: 'var(--text-primary)',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ width: 88, height: 88, borderRadius: 22, background: 'var(--accent)', color: '#1a1300', fontSize: 38, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'pulse 2s infinite' }}>pH</div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 32, fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: -1, marginBottom: 8
      }}>
        AgriTrader
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 40, letterSpacing: 1, textTransform: 'uppercase' }}>
        Agricultural Market Management
      </div>

      {/* Progress bar */}
      <div style={{ width: 280, background: 'var(--border)', borderRadius: 8, height: 6, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          borderRadius: 8, transition: 'width 0.5s ease'
        }} />
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {status}{dots}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
