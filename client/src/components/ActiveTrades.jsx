import React, { useState, useEffect } from 'react';

export default function ActiveTrades({ trades, prices }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  if (trades.length === 0) {
    return null;
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '8px 20px 8px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {trades.map(trade => {
          const elapsed = now - trade.createdAt;
          const total = trade.expiresAt - trade.createdAt;
          const remaining = Math.max(0, trade.expiresAt - now);
          const progress = (elapsed / total) * 100;
          const currentPrice = prices[trade.asset];
          const isUp = currentPrice >= trade.entryPrice;
          const isWinning = trade.direction === 'up' ? isUp : !isUp;

          return (
            <div
              key={trade.id}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: isWinning ? 'rgba(0,200,83,0.04)' : 'rgba(255,23,68,0.04)',
                border: '1px solid ' + (isWinning ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)'),
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{trade.asset}/USD</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: trade.direction === 'up' ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: trade.direction === 'up' ? 'var(--green)' : 'var(--red)',
                    letterSpacing: '0.5px',
                  }}>
                    {trade.direction === 'up' ? '↑ CALL' : '↓ PUT'}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  ${trade.amount.toFixed(2)}
                </span>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}>
                <span>Entry: ${trade.entryPrice.toFixed(2)}</span>
                <span>Now: ${currentPrice?.toFixed(2) || '...'}</span>
                <span style={{
                  color: isWinning ? 'var(--green)' : 'var(--red)',
                  fontWeight: 700,
                }}>
                  {isWinning ? '+$' + (currentPrice - trade.entryPrice).toFixed(2) : '-$' + (trade.entryPrice - currentPrice).toFixed(2)}
                </span>
              </div>

              <div style={{
                width: '100%', height: '3px', borderRadius: '2px',
                background: 'var(--bg-hover)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(100, progress)}%`,
                  height: '100%',
                  borderRadius: '2px',
                  background: isWinning
                    ? 'linear-gradient(90deg, var(--green), #69f0ae)'
                    : 'linear-gradient(90deg, var(--red), #ff5252)',
                  transition: 'width 0.3s linear',
                }} />
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: '4px',
                fontSize: '10px', color: 'var(--text-muted)'
              }}>
                <span>{trade.duration} · {trade.direction === 'up' ? 'CALL' : 'PUT'}</span>
                <span style={{ fontWeight: 600 }}>{Math.ceil(remaining / 1000)}s left</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
