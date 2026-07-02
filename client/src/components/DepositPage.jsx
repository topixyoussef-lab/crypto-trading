import React, { useState } from 'react';

const USDT_ADDRESS = '0x9b2f7f79a4e5e45ff3218bcd6299cda3011845d3';

export default function DepositPage({ onDeposit, onWithdraw, onClose }) {
  const [copied, setCopied] = useState(false);
  const [wdAddr, setWdAddr] = useState('');
  const [wdAmt, setWdAmt] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(USDT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)',
    background: 'var(--bg-primary)', color: '#e2e8f0', fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--bg-primary)', overflowY: 'auto',
    }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>Deposit / Withdraw</div>
          <button onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >&larr; Back</button>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '24px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#26a17b20', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#26a17b',
            }}>T</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>USDT (ERC-20)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Send USDT to this address for deposit</div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              ...inputStyle, padding: '14px', fontSize: '12px', fontFamily: 'monospace',
              wordBreak: 'break-all', paddingRight: '90px',
            }}>
              {USDT_ADDRESS}
            </div>
            <button onClick={handleCopy}
              style={{
                position: 'absolute', right: '6px', top: '6px',
                padding: '8px 14px', borderRadius: '6px', border: 'none',
                background: copied ? 'var(--green)' : 'var(--blue)',
                color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >{copied ? 'Copied!' : 'Copy'}</button>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Send only <strong style={{ color: '#e2e8f0' }}>USDT</strong> on <strong style={{ color: '#e2e8f0' }}>ERC-20</strong>.
          </div>

          {!detected && (
            <button onClick={() => {
              if (scanning) return;
              setScanning(true);
              setTimeout(() => {
                const amount = parseFloat((Math.random() * 500 + 20).toFixed(2));
                onDeposit(amount);
                setScanning(false);
                setDetected(true);
              }, 3000);
            }}
              style={{
                marginTop: '16px', padding: '14px', borderRadius: '10px', border: 'none',
                width: '100%', background: scanning ? 'var(--bg-card)' : 'var(--blue)',
                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: scanning ? 'not-allowed' : 'pointer',
              }}
            >{scanning ? 'Scanning blockchain...' : 'Detect Incoming Deposit'}</button>
          )}
          {detected && (
            <div style={{
              marginTop: '16px', padding: '14px', borderRadius: '10px',
              background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)',
              color: 'var(--green)', fontSize: '14px', fontWeight: 600, textAlign: 'center',
            }}>
              Deposit detected and credited to your balance!
              <button onClick={() => setDetected(false)}
                style={{
                  display: 'block', margin: '10px auto 0', padding: '8px 16px',
                  borderRadius: '8px', border: '1px solid rgba(0,200,83,0.3)',
                  background: 'transparent', color: 'var(--green)', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >Detect Another Deposit</button>
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px' }}>Withdraw</div>
          <input value={wdAddr} onChange={e => setWdAddr(e.target.value)}
            placeholder="USDT address (ERC-20)"
            style={{ ...inputStyle, marginBottom: '10px', fontSize: '12px', fontFamily: 'monospace' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={wdAmt} onChange={e => setWdAmt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && wdAddr.length >= 20 && parseFloat(wdAmt) > 0) { onWithdraw(parseFloat(wdAmt)); setWdAmt(''); setWdAddr(''); } }}
              placeholder="USDT amount" type="number" min="1" style={inputStyle} />
            <button onClick={() => { if (wdAddr.length >= 20 && parseFloat(wdAmt) > 0) { onWithdraw(parseFloat(wdAmt)); setWdAmt(''); setWdAddr(''); } }}
              style={{
                padding: '12px 24px', borderRadius: '10px', border: 'none',
                background: 'var(--red)', color: '#fff', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                opacity: wdAddr.length >= 20 && parseFloat(wdAmt) > 0 ? 1 : 0.5,
              }}
            >Withdraw</button>
          </div>
        </div>
      </div>
    </div>
  );
}
