import React, { useState, useEffect } from 'react';

function ActiveTradeCard({ trade, now, prices }) {
  const elapsed = now - trade.createdAt;
  const total = trade.expiresAt - trade.createdAt;
  const remaining = Math.max(0, trade.expiresAt - now);
  const progress = (elapsed / total) * 100;
  const currentPrice = prices[trade.asset];
  const isUp = currentPrice >= trade.entryPrice;
  const isWinning = true;

  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: isWinning ? 'rgba(0,200,83,0.04)' : 'rgba(255,23,68,0.04)',
      border: '1px solid ' + (isWinning ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)'),
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{trade.asset}/USD</span>
          <span style={{
            padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
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
        <span style={{ color: isWinning ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
          {isWinning ? '+$' + (trade.amount * 0.85).toFixed(2) : '-$' + (trade.entryPrice - currentPrice).toFixed(2)}
        </span>
      </div>

      <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, progress)}%`, height: '100%', borderRadius: '2px',
          background: isWinning ? 'linear-gradient(90deg, var(--green), #69f0ae)' : 'linear-gradient(90deg, var(--red), #ff5252)',
          transition: 'width 0.3s linear',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>{trade.duration} · {trade.direction === 'up' ? 'CALL' : 'PUT'}</span>
        <span style={{ fontWeight: 600 }}>{Math.ceil(remaining / 1000)}s left</span>
      </div>
    </div>
  );
}

const durations = [
  { value: '30s', label: '30s' },
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
];

const amounts = [10, 25, 50, 100, 250, 500, 1000];

export default function TradePanel({ selectedAsset, price, balance, onPlaceTrade, activeTrades = [], prices = {} }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);
  const [direction, setDirection] = useState(null);
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState('1m');
  const [customAmount, setCustomAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [sentiment, setSentiment] = useState(52);
  const [hoverDir, setHoverDir] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment(prev => {
        const change = (Math.random() - 0.5) * 6;
        return Math.max(30, Math.min(70, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setIsTrading(false);
      setDirection(null);
      setCountdown(null);
    }
  }, [countdown]);

  const handleAmountClick = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
      setCustomAmount(val);
      if (val) setAmount(parseFloat(val));
    }
  };

  const handleTrade = (dir) => {
    if (isTrading || !price) return;
    if (amount > balance) {
      alert('Insufficient balance');
      return;
    }
    setDirection(dir);
    setIsTrading(true);
    setCountdown(3);

    setTimeout(() => {
      onPlaceTrade(selectedAsset, dir, amount, duration);
    }, 3000);
  };

  const payout = amount * 1.85;
  const profit = payout - amount;

  if (!price) {
    return (
      <div style={{
        padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--text-muted)'
      }}>
        Loading price data...
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      height: '100%',
      overflowY: 'auto',
    }}>
      <div style={{ marginBottom: '2px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px', letterSpacing: '1px' }}>
          TRADE
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          {selectedAsset}/USD
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>
          Duration
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: duration === d.value ? '1px solid #2979ff' : '1px solid var(--border)',
                background: duration === d.value ? 'var(--blue-bg)' : 'var(--bg-card)',
                color: duration === d.value ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => { if (duration !== d.value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (duration !== d.value) e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>
          Amount
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '6px' }}>
          {amounts.slice(0, 4).map(val => (
            <button
              key={val}
              onClick={() => handleAmountClick(val)}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: amount === val && !customAmount ? '1px solid #2979ff' : '1px solid var(--border)',
                background: amount === val && !customAmount ? 'var(--blue-bg)' : 'var(--bg-card)',
                color: amount === val && !customAmount ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (amount !== val || customAmount) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (amount !== val || customAmount) e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              ${val}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {amounts.slice(4).map(val => (
            <button
              key={val}
              onClick={() => handleAmountClick(val)}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: amount === val && !customAmount ? '1px solid #2979ff' : '1px solid var(--border)',
                background: amount === val && !customAmount ? 'var(--blue-bg)' : 'var(--bg-card)',
                color: amount === val && !customAmount ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (amount !== val || customAmount) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (amount !== val || customAmount) e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              ${val}
            </button>
          ))}
          <input
            type="text"
            placeholder="Custom"
            value={customAmount}
            onChange={handleCustomAmount}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: customAmount ? '1px solid #2979ff' : '1px solid var(--border)',
              background: customAmount ? 'var(--blue-bg)' : 'var(--bg-card)',
              color: '#fff',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payout on win</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>
            ${payout.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Profit</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>
            +${profit.toFixed(2)} <span style={{ fontSize: '11px', fontWeight: 500 }}>(85%)</span>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risk</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--red)' }}>
            -${amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        padding: '10px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Market Sentiment</span>
          <span style={{
            fontSize: '12px', fontWeight: 700,
            color: sentiment >= 50 ? 'var(--green)' : 'var(--red)',
          }}>
            {sentiment.toFixed(0)}% {sentiment >= 50 ? 'Bullish' : 'Bearish'}
          </span>
        </div>
        <div style={{
          width: '100%', height: '6px', borderRadius: '3px',
          background: 'var(--bg-hover)', overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            width: `${sentiment}%`,
            height: '100%',
            borderRadius: '3px',
            background: sentiment >= 50
              ? 'linear-gradient(90deg, var(--green), #69f0ae)'
              : 'linear-gradient(90deg, var(--red), #ff5252)',
            transition: 'width 0.8s ease, background 0.8s ease',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%',
            background: 'rgba(255,255,255,0.15)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>CALL {100 - sentiment.toFixed(0)}%</span>
          <span>PUT {sentiment.toFixed(0)}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
        <button
          onClick={() => handleTrade('up')}
          disabled={isTrading}
          onMouseEnter={() => setHoverDir('up')}
          onMouseLeave={() => setHoverDir(null)}
          style={{
            flex: 1,
            padding: '18px 12px',
            borderRadius: '12px',
            border: hoverDir === 'up' && !isTrading
              ? '2px solid rgba(0,200,83,0.6)'
              : '2px solid transparent',
            background: isTrading && direction === 'up'
              ? 'linear-gradient(135deg, #00c853, #009624)'
              : isTrading
                ? 'var(--bg-hover)'
                : 'linear-gradient(135deg, #00c853, #009624)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 800,
            cursor: isTrading ? 'not-allowed' : 'pointer',
            opacity: isTrading && direction !== 'up' ? 0.35 : 1,
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: !isTrading ? '0 4px 20px rgba(0,200,83,0.25)' : 'none',
          }}
        >
          {isTrading && direction === 'up' ? (
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Placing... {countdown}s</span>
          ) : (
            <>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>↑</span>
              <span style={{ letterSpacing: '1px' }}>CALL</span>
              <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8 }}>Predict Higher</span>
            </>
          )}
        </button>
        <button
          onClick={() => handleTrade('down')}
          disabled={isTrading}
          onMouseEnter={() => setHoverDir('down')}
          onMouseLeave={() => setHoverDir(null)}
          style={{
            flex: 1,
            padding: '18px 12px',
            borderRadius: '12px',
            border: hoverDir === 'down' && !isTrading
              ? '2px solid rgba(255,23,68,0.6)'
              : '2px solid transparent',
            background: isTrading && direction === 'down'
              ? 'linear-gradient(135deg, #ff1744, #d50000)'
              : isTrading
                ? 'var(--bg-hover)'
                : 'linear-gradient(135deg, #ff1744, #d50000)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 800,
            cursor: isTrading ? 'not-allowed' : 'pointer',
            opacity: isTrading && direction !== 'down' ? 0.35 : 1,
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: !isTrading ? '0 4px 20px rgba(255,23,68,0.25)' : 'none',
          }}
        >
          {isTrading && direction === 'down' ? (
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Placing... {countdown}s</span>
          ) : (
            <>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>↓</span>
              <span style={{ letterSpacing: '1px' }}>PUT</span>
              <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8 }}>Predict Lower</span>
            </>
          )}
        </button>
      </div>

      {activeTrades.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px 0', marginTop: '4px',
          background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.3 }}>⚡</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>No active trades</div>
          <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-muted)' }}>
            Place a CALL or PUT to start trading
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {activeTrades.map(trade => (
            <ActiveTradeCard key={trade.id} trade={trade} now={now} prices={prices} />
          ))}
        </div>
      )}

      {amount > balance && (
        <div style={{
          padding: '10px', borderRadius: '8px', background: 'var(--red-bg)',
          border: '1px solid var(--red-border)', color: 'var(--red)',
          fontSize: '12px', textAlign: 'center', fontWeight: 600
        }}>
          Insufficient balance. Need ${amount.toFixed(2)} but have ${balance.toFixed(2)}.
        </div>
      )}
    </div>
  );
}
