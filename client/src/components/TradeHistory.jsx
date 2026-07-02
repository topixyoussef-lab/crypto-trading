import React from 'react';

export default function TradeHistory({ trades }) {
  if (trades.length === 0) {
    return null;
  }

  const wins = trades.filter(t => t.isWin).length;
  const totalPnl = trades.reduce((sum, t) => sum + (t.profit || 0), 0);

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '8px 20px 8px',
    }}>
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '8px',
        padding: '10px 14px', borderRadius: '10px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Win Rate</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>
            {trades.length > 0 ? ((wins / trades.length) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Total P&amp;L</div>
          <div style={{
            fontSize: '16px', fontWeight: 700,
            color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Trades</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{trades.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {trades.map((trade) => (
          <div
            key={trade.id}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: trade.isWin ? 'rgba(0,200,83,0.04)' : 'rgba(255,23,68,0.04)',
              border: '1px solid ' + (trade.isWin ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)'),
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {trade.isWin ? '✅' : '❌'}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>#{trade.id.slice(0, 6)}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: '3px', fontSize: '9px',
                      fontWeight: 700, letterSpacing: '0.5px',
                      background: trade.entryPrice <= (trade.exitPrice || trade.entryPrice)
                        ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: trade.entryPrice <= (trade.exitPrice || trade.entryPrice)
                        ? 'var(--green)' : 'var(--red)',
                    }}>
                      {trade.entryPrice <= (trade.exitPrice || trade.entryPrice) ? 'CALL' : 'PUT'}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ${trade.entryPrice?.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: trade.isWin ? 'var(--green)' : 'var(--red)',
                }}>
                  {trade.isWin ? '+' : ''}{trade.profit?.toFixed(2)}
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 600,
                  color: trade.isWin ? 'var(--green)' : 'var(--red)',
                  opacity: 0.7,
                }}>
                  {trade.isWin ? 'WIN' : 'LOSS'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
