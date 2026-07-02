import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import TradingDashboard from './components/TradingDashboard';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);
  const [prices, setPrices] = useState({});
  const [ohlcv, setOhlcv] = useState({});
  const [balance, setBalance] = useState(0);
  const [activeTrades, setActiveTrades] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});
  const socketRef = useRef(null);
  const pendingTradesRef = useRef({});

  useEffect(() => {
    const s = io(SOCKET_URL);
    socketRef.current = s;

    const doAutoLogin = () => {
      s.emit('login', { username: 'Demo' });
    };

    if (s.connected) {
      doAutoLogin();
    } else {
      s.on('connect', doAutoLogin);
    }

    s.on('prices', (data) => {
      setPrices(prev => {
        const updated = { ...data };
        setPriceHistory(ph => {
          const newPh = { ...ph };
          Object.keys(updated).forEach(key => {
            if (!newPh[key]) newPh[key] = [];
            newPh[key] = [...newPh[key].slice(-119), { time: Date.now(), price: updated[key] }];
          });
          return newPh;
        });
        return updated;
      });
    });

    s.on('ohlcv', (data) => {
      setOhlcv(data);
    });

    s.on('loginSuccess', (data) => {
      setUser({ id: data.id, username: data.username });
      setBalance(data.balance);
    });

    s.on('balanceUpdate', (data) => {
      setBalance(data.balance);
    });

    s.on('tradePlaced', (trade) => {
      pendingTradesRef.current[trade.id] = trade;
      setActiveTrades(prev => [...prev, trade]);
    });

    s.on('tradeResult', (result) => {
      const trade = pendingTradesRef.current[result.id];
      const realPayout = trade ? trade.amount * 1.85 : result.payout;
      setActiveTrades(prev => prev.filter(t => t.id !== result.id));
      setBalance(prev => prev + realPayout);
      delete pendingTradesRef.current[result.id];
    });

    s.on('tradeError', (error) => {
      alert(error.message);
    });

    s.on('activeTrades', (trades) => {
      setActiveTrades(trades);
    });

    return () => s.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceTrade = useCallback((asset, direction, amount, duration) => {
    if (socketRef.current && user) {
      socketRef.current.emit('placeTrade', {
        userId: user.id,
        asset,
        direction,
        amount,
        duration
      });
    }
  }, [user]);

  return (
    <TradingDashboard
      user={user}
      balance={balance}
      prices={prices}
      priceHistory={priceHistory}
      ohlcv={ohlcv}
      activeTrades={activeTrades}
      onPlaceTrade={handlePlaceTrade}
    />
  );
}

export default App;
