import React, { useState, useRef, useEffect } from 'react';
import TradePanel from './TradePanel';
import PriceChart from './PriceChart';
import MarketTicker from './MarketTicker';
import DepositPage from './DepositPage';

const styles = {
  container: {
    height: '100vh',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  header: {
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2979ff, #00c853)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 800,
  },
  balance: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    background: 'rgba(0,200,83,0.1)',
    border: '1px solid rgba(0,200,83,0.2)',
  },
  balanceLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  balanceValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--green)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '0',
    height: 'calc(100vh - 64px)',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border)',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden auto',
  },
  chartArea: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
};

const assets = [
  { id: 'BTC', name: 'Bitcoin', color: '#f7931a' },
  { id: 'ETH', name: 'Ethereum', color: '#627eea' },
  { id: 'SOL', name: 'Solana', color: '#9945ff' },
  { id: 'BNB', name: 'BNB', color: '#f3ba2f' },

];

function getRealBalance() {
  return parseFloat(localStorage.getItem('real_balance') || '0');
}

function setRealBalance(val) {
  localStorage.setItem('real_balance', val.toString());
}

let realTradeIdCounter = 0;

const durMap = { '30s': 30, '1m': 60, '5m': 300, '15m': 900 };

export default function TradingDashboard({
  user, balance, prices, priceHistory, ohlcv, activeTrades,
  onPlaceTrade
}) {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [showDeposit, setShowDeposit] = useState(false);
  const [accountMode, setAccountMode] = useState('demo');
  const [realBal, setRealBal] = useState(getRealBalance);
  const [realTrades, setRealTrades] = useState([]);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  const handleRealDeposit = (amount) => {
    const newBal = realBal + amount;
    setRealBal(newBal);
    setRealBalance(newBal);
  };

  const handleRealWithdraw = (amount) => {
    if (amount > realBal) return;
    const newBal = realBal - amount;
    setRealBal(newBal);
    setRealBalance(newBal);
  };

  const handleRealPlaceTrade = (asset, direction, amount, duration) => {
    if (amount > realBal) return;
    const entryPrice = pricesRef.current[asset];
    if (!entryPrice) return;

    const secs = durMap[duration] || 60;
    const id = ++realTradeIdCounter;
    const createdAt = Date.now();
    const expiresAt = createdAt + secs * 1000;

    const trade = { id, asset, direction, amount, entryPrice, createdAt, expiresAt };
    setRealTrades(prev => [...prev, trade]);
    setRealBal(prev => {
      const newBal = prev - amount;
      setRealBalance(newBal);
      return newBal;
    });

    setTimeout(() => {
      const currentPrice = pricesRef.current[asset];
      if (!currentPrice) return;
      const isUp = currentPrice >= entryPrice;
      const won = direction === 'up' ? isUp : !isUp;
      if (won) {
        const payout = amount * 1.85;
        setRealBal(prev2 => {
          const newBal2 = prev2 + payout;
          setRealBalance(newBal2);
          return newBal2;
        });
      }
      setRealTrades(prev => prev.filter(t => t.id !== id));
    }, secs * 1000);
  };

  const displayBalance = accountMode === 'demo' ? balance : realBal;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="/logo.png" alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          NexaTrade
        </div>
        <div style={styles.userInfo}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setAccountMode('demo')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                background: accountMode === 'demo' ? 'var(--blue)' : 'var(--bg-card)',
                color: accountMode === 'demo' ? '#fff' : 'var(--text-muted)',
              }}
            >Demo</button>
            <button onClick={() => setAccountMode('real')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                background: accountMode === 'real' ? '#26a17b' : 'var(--bg-card)',
                color: accountMode === 'real' ? '#fff' : 'var(--text-muted)',
              }}
            >Real</button>
          </div>
          <div style={styles.balance}>
            <span style={styles.balanceLabel}>
              {accountMode === 'demo' ? 'Demo Balance' : 'Real Balance'}
            </span>
            <span style={styles.balanceValue}>
              ${displayBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {accountMode === 'real' && (
            <button onClick={() => setShowDeposit(true)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--green)', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >Deposit / Withdraw</button>
          )}
          {showDeposit && (
            <DepositPage
              onDeposit={handleRealDeposit}
              onWithdraw={handleRealWithdraw}
              onClose={() => setShowDeposit(false)}
            />
          )}
        </div>
      </header>

      <div style={styles.main}>
        <div style={styles.leftPanel}>
          <div style={styles.chartArea}>
            <MarketTicker
              assets={assets}
              prices={prices}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
            />
            <PriceChart
              asset={selectedAsset}
              price={prices[selectedAsset]}
              history={priceHistory[selectedAsset] || []}
              ohlcv={ohlcv[selectedAsset]}
            />
          </div>
        </div>

        <div style={styles.rightPanel}>
          <TradePanel
            selectedAsset={selectedAsset}
            price={prices[selectedAsset]}
            balance={displayBalance}
            onPlaceTrade={accountMode === 'demo' ? onPlaceTrade : handleRealPlaceTrade}
            activeTrades={accountMode === 'demo' ? activeTrades : realTrades}
            prices={prices}
          />
        </div>
      </div>
    </div>
  );
}
