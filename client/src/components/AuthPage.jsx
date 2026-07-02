import React, { useState } from 'react';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function AuthPage({ user, balance, onLogin, onRegister, onLogout, loginError, onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (!isValidEmail(email) || !password) return;
    if (mode === 'register') {
      onRegister(email, password, username || email.split('@')[0]);
    } else {
      onLogin(email, password);
    }
  };

  const inputStyle = {
    padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)',
    background: 'var(--bg-primary)', color: '#e2e8f0', fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: '12px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #2979ff, #00c853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800, color: '#fff',
            margin: '0 auto 16px',
          }}>CT</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                background: mode === m ? 'var(--blue)' : 'var(--bg-primary)',
                color: mode === m ? '#fff' : 'var(--text-muted)',
              }}
            >{m === 'login' ? 'Login' : 'Register'}</button>
          ))}
        </div>

        <input value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Email address" style={inputStyle} />

        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Password" style={{ ...inputStyle, marginBottom: mode === 'register' ? '12px' : '20px' }} />

        {mode === 'register' && (
          <input value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Username (optional)" style={inputStyle} />
        )}

        {loginError && (
          <div style={{
            fontSize: '12px', color: 'var(--red)', marginBottom: '12px',
            padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,23,68,0.08)',
          }}>{loginError}</div>
        )}

        <button onClick={handleSubmit}
          style={{
            padding: '12px 0', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #2979ff, #00c853)',
            color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            width: '100%', opacity: isValidEmail(email) && password ? 1 : 0.5,
          }}
        >{mode === 'register' ? 'Create Account' : 'Login'}</button>

        {user ? (
          <div style={{
            marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Logged in as <strong style={{ color: '#e2e8f0' }}>{user.username}</strong>
            </div>
            <button onClick={onLogout}
              style={{
                padding: '8px 24px', borderRadius: '8px', border: '1px solid var(--red)',
                background: 'transparent', color: 'var(--red)', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >Logout</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '13px', cursor: 'pointer', padding: '4px 8px',
              }}
            >Continue as Guest</button>
          </div>
        )}
      </div>
    </div>
  );
}
