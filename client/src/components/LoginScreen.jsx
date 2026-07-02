import React, { useState } from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #0f1923 0%, #0a0e17 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  bgGlow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(41,121,255,0.08) 0%, transparent 70%)',
    top: '-200px',
    right: '-200px',
    pointerEvents: 'none'
  },
  bgGlow2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,200,83,0.05) 0%, transparent 70%)',
    bottom: '-150px',
    left: '-150px',
    pointerEvents: 'none'
  },
  card: {
    background: 'linear-gradient(135deg, rgba(26,31,46,0.9) 0%, rgba(17,24,39,0.9) 100%)',
    backdropFilter: 'blur(20px)',
    padding: '48px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.06)',
    width: '420px',
    maxWidth: '90vw',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease-out'
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #2979ff, #00c853)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto 20px',
    fontWeight: 800,
    color: '#fff'
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    marginBottom: '32px',
    lineHeight: 1.5
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    marginBottom: '16px'
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #2979ff, #1565c0)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  demoBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(41,121,255,0.15)',
    color: '#2979ff',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '20px'
  }
};

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGlow} />
      <div style={styles.bgGlow2} />
      <div style={styles.card}>
        <img src="/logo.png" alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', marginBottom: '16px' }} />
        <h1 style={styles.title}>CryptoTrade Pro</h1>
        <p style={styles.subtitle}>
          Trade Bitcoin, Ethereum & more with binary options.<br />
          Predict the market, earn up to 85% profit.
        </p>
        <div style={styles.demoBadge}>Demo Account · $10,000 Virtual</div>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#2979ff'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            style={styles.button}
            type="submit"
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Start Trading
          </button>
        </form>
      </div>
    </div>
  );
}
