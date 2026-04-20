import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Wheat } from 'lucide-react';

// ── Credentials (change these as needed) ──────────────────────
const VALID_USERS = [
  { username: 'moinuddin', password: 'md@1234' },
  { username: 'admin',   password: 'admin@123' },
];

// Trial login policy for customer demo account
// Update this date when needed (YYYY-MM-DD).
const TRIAL_USER = 'moinuddin';
const TRIAL_EXPIRES_ON = '2026-05-11';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error,    setError]     = useState('');
  const [loading,  setLoading]   = useState(false);
  const [shake,    setShake]     = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const normalizedUser = username.trim().toLowerCase();
      const valid = VALID_USERS.find(
        u => u.username === normalizedUser && u.password === password
      );
      if (valid) {
        // Trial account expires after configured date (inclusive end at local midnight next day)
        if (normalizedUser === TRIAL_USER) {
          const expiresAt = new Date(`${TRIAL_EXPIRES_ON}T23:59:59`);
          if (new Date() > expiresAt) {
            setError(`Trial expired on ${TRIAL_EXPIRES_ON}. Please contact admin to continue.`);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setLoading(false);
            return;
          }
        }

        // Save to sessionStorage so refresh doesn't log out
        sessionStorage.setItem('ph_logged_in', '1');
        sessionStorage.setItem('ph_user', normalizedUser);
        onLogin(normalizedUser);
      } else {
        setError('Invalid username or password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(26,86,219,0.12) 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, padding:'0 20px' }}>

        {/* Card */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:16, overflow:'hidden',
          boxShadow:'0 24px 60px rgba(0,0,0,0.4)',
          animation: shake ? 'shake 0.5s ease' : 'fadeInUp 0.4s ease',
        }}>

          {/* Top accent bar */}
          <div style={{ height:4, background:'linear-gradient(90deg, #1a56db, #f59e0b, #10b981)' }}/>

          {/* Header */}
          <div style={{ padding:'32px 36px 24px', textAlign:'center', borderBottom:'1px solid var(--border)' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%',
              background:'linear-gradient(135deg, #1a56db, #2563eb)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 16px',
              boxShadow:'0 8px 24px rgba(26,86,219,0.4)',
            }}>
              <span style={{ fontSize:28 }}>🌾</span>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:'var(--text-primary)', fontFamily:'var(--font-display)', marginBottom:4 }}>
              Md. Moinuddin
            </div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)' }}>
              APMC Market Management
            </div>
          </div>

          {/* Form */}
          <div style={{ padding:'28px 36px 32px' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20, textAlign:'center' }}>
              Sign in to continue
            </div>

            <form onSubmit={submit}>
              {/* Username */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:7 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoFocus
                  style={{
                    width:'100%', padding:'11px 14px',
                    background:'var(--bg-panel)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                    borderRadius:9, color:'var(--text-primary)',
                    fontFamily:'var(--font-body)', fontSize:14, outline:'none',
                    transition:'border-color 0.2s',
                    textTransform:'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a56db'}
                  onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:7 }}>
                  Password
                </label>
                <div style={{ position:'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    style={{
                      width:'100%', padding:'11px 44px 11px 14px',
                      background:'var(--bg-panel)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                      borderRadius:9, color:'var(--text-primary)',
                      fontFamily:'var(--font-body)', fontSize:14, outline:'none',
                      transition:'border-color 0.2s',
                      textTransform:'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1a56db'}
                    onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                      display:'flex', alignItems:'center', padding:4,
                    }}
                  >
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:8, padding:'9px 13px', marginBottom:16,
                  fontSize:12, fontWeight:600, color:'var(--red)',
                  display:'flex', alignItems:'center', gap:7,
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%', padding:'12px',
                  background: loading ? 'var(--bg-panel)' : 'linear-gradient(135deg, #1a56db, #2563eb)',
                  border:'none', borderRadius:9, cursor: loading ? 'not-allowed' : 'pointer',
                  color:'#fff', fontSize:14, fontWeight:700,
                  fontFamily:'var(--font-body)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(26,86,219,0.35)',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                    Signing in...
                  </>
                ) : (
                  <><LogIn size={16}/> Sign In</>
                )}
              </button>
            </form>

            {/* Footer note */}
            <div style={{ textAlign:'center', marginTop:20, fontSize:11, color:'var(--text-muted)' }}>
              <Wheat size={11} style={{ marginRight:5, color:'var(--accent)' }}/>
              APMC Market Yard, Humnabad · Bidar (KA)
            </div>
          </div>
        </div>

        {/* Version tag */}
        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'var(--text-muted)', opacity:0.6 }}>
          PH AgriTrader v1.0
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: var(--text-muted); opacity: 0.6; }
      `}</style>
    </div>
  );
}
