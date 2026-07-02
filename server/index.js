import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import crypto from 'crypto';

const USERS_FILE = './users.json';

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    const map = new Map();
    arr.forEach(u => map.set(u.id, u));
    return map;
  } catch {
    return new Map();
  }
}

function saveUsers(users) {
  const arr = Array.from(users.values());
  fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return salt + ':' + derivedKey.toString('hex');
}

function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return key === derivedKey.toString('hex');
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const cryptoConfig = [
  { id: 'BTC', name: 'Bitcoin', basePrice: 65000, volatility: 0.004 },
  { id: 'ETH', name: 'Ethereum', basePrice: 3400, volatility: 0.005 },
  { id: 'SOL', name: 'Solana', basePrice: 145, volatility: 0.006 },
  { id: 'BNB', name: 'BNB', basePrice: 580, volatility: 0.004 },
  { id: 'XRP', name: 'XRP', basePrice: 0.62, volatility: 0.007 },
];

const users = loadUsers();
const activeTrades = new Map();
const prices = {};
const ohlcvData = {};
const candleBuffer = {};
const trend = {};

function seededRandom() {
  return Math.random();
}

function generateCandlestick(prevClose, volatility) {
  const open = prevClose;
  const change = (seededRandom() - 0.5) * 2 * volatility * open;
  const close = open + change;
  const high = Math.max(open, close) + Math.abs(change) * (0.2 + seededRandom() * 0.8);
  const low = Math.min(open, close) - Math.abs(change) * (0.2 + seededRandom() * 0.8);
  return {
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
  };
}

function initializePrices() {
  cryptoConfig.forEach(c => {
    prices[c.id] = c.basePrice;
    ohlcvData[c.id] = [];
    candleBuffer[c.id] = { ...generateCandlestick(c.basePrice, c.volatility) };
    candleBuffer[c.id].time = Math.floor(Date.now() / 1000);
    trend[c.id] = Math.random() > 0.5 ? 1 : -1;
  });
}

function updatePrices() {
  const now = Date.now();
  const currentSecond = Math.floor(now / 1000);

  cryptoConfig.forEach(c => {
    if (seededRandom() < 0.01) trend[c.id] *= -1;

    const jitter = (seededRandom() - 0.5) * c.volatility * prices[c.id];
    const drift = trend[c.id] * c.volatility * prices[c.id] * 0.1;
    const spike = seededRandom() < 0.02 ? (seededRandom() - 0.5) * c.volatility * prices[c.id] * 3 : 0;

    prices[c.id] = parseFloat((prices[c.id] + jitter + drift + spike).toFixed(2));

    if (prices[c.id] > candleBuffer[c.id].high) candleBuffer[c.id].high = prices[c.id];
    if (prices[c.id] < candleBuffer[c.id].low) candleBuffer[c.id].low = prices[c.id];
    candleBuffer[c.id].close = prices[c.id];

    if (currentSecond !== candleBuffer[c.id].time) {
      const finalCandle = { ...candleBuffer[c.id], time: candleBuffer[c.id].time };
      ohlcvData[c.id].push(finalCandle);
      if (ohlcvData[c.id].length > 500) ohlcvData[c.id].shift();

      const newOpen = prices[c.id];
      candleBuffer[c.id] = {
        time: currentSecond,
        open: newOpen,
        high: newOpen,
        low: newOpen,
        close: newOpen,
      };
    }
  });

  io.emit('prices', prices);

  const ohlcvUpdate = {};
  cryptoConfig.forEach(c => {
    ohlcvUpdate[c.id] = {
      current: candleBuffer[c.id],
      history: ohlcvData[c.id].slice(-120),
    };
  });
  io.emit('ohlcv', ohlcvUpdate);
}

function processExpiredTrades(trade, currentPrices) {
  const assetPrice = currentPrices[trade.asset];
  if (!assetPrice) return;

  const user = users.get(trade.userId);
  const isWin = true;

  const payout = isWin ? trade.amount * 1.85 : 0;

  if (user) {
    user.balance += payout;
  }

  io.to(trade.userId).emit('tradeResult', {
    id: trade.id,
    isWin,
    payout,
    entryPrice: trade.entryPrice,
    exitPrice: assetPrice,
    profit: isWin ? payout - trade.amount : -trade.amount
  });

  if (user) {
    io.to(trade.userId).emit('balanceUpdate', { balance: user.balance });
  }

  activeTrades.delete(trade.id);
}

setInterval(() => {
  updatePrices();
}, 1000);

setInterval(() => {
  const now = Date.now();
  const currentPrices = { ...prices };
  const expired = [];
  for (const [id, trade] of activeTrades) {
    if (now >= trade.expiresAt) {
      expired.push(trade);
    }
  }
  expired.forEach(trade => processExpiredTrades(trade, currentPrices));
}, 500);

initializePrices();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('prices', prices);

  const ohlcvSnapshot = {};
  cryptoConfig.forEach(c => {
    ohlcvSnapshot[c.id] = {
      current: candleBuffer[c.id],
      history: ohlcvData[c.id].slice(-120),
    };
  });
  socket.emit('ohlcv', ohlcvSnapshot);

  socket.on('register', ({ email, password, username }) => {
    if (!email || !password) {
      socket.emit('loginError', { message: 'Email and password are required' });
      return;
    }
    for (const [, u] of users) {
      if (u.email === email) {
        socket.emit('loginError', { message: 'Email already registered' });
        return;
      }
    }
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      username: username || email.split('@')[0],
      passwordHash: hashPassword(password),
      balance: 0,
      socketId: socket.id
    };
    users.set(userId, user);
    saveUsers(users);
    socket.join(userId);

    socket.emit('loginSuccess', {
      id: userId,
      username: user.username,
      balance: user.balance
    });
  });

  socket.on('deposit', ({ userId, amount }) => {
    const user = users.get(userId);
    if (!user) {
      socket.emit('loginError', { message: 'User not found' });
      return;
    }
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      socket.emit('loginError', { message: 'Invalid amount' });
      return;
    }
    user.balance += depositAmount;
    if (user.email) saveUsers(users);
    socket.emit('balanceUpdate', { balance: user.balance });
  });

  socket.on('withdraw', ({ userId, amount }) => {
    const user = users.get(userId);
    if (!user) {
      socket.emit('loginError', { message: 'User not found' });
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      socket.emit('loginError', { message: 'Invalid amount' });
      return;
    }
    if (withdrawAmount > user.balance) {
      socket.emit('loginError', { message: 'Insufficient balance' });
      return;
    }
    user.balance -= withdrawAmount;
    if (user.email) saveUsers(users);
    socket.emit('balanceUpdate', { balance: user.balance });
  });

  socket.on('loginWithEmail', ({ email, password }) => {
    if (!email || !password) {
      socket.emit('loginError', { message: 'Email and password are required' });
      return;
    }
    let foundUser = null;
    for (const [, u] of users) {
      if (u.email === email) {
        foundUser = u;
        break;
      }
    }
    if (!foundUser || !verifyPassword(password, foundUser.passwordHash)) {
      socket.emit('loginError', { message: 'Invalid email or password' });
      return;
    }
    foundUser.socketId = socket.id;
    saveUsers(users);
    socket.join(foundUser.id);

    socket.emit('loginSuccess', {
      id: foundUser.id,
      username: foundUser.username,
      balance: foundUser.balance
    });
  });

  socket.on('login', ({ username }) => {
    const userId = uuidv4();
    const user = {
      id: userId,
      username: username || 'Trader',
      balance: 10000,
      socketId: socket.id
    };
    users.set(userId, user);
    socket.join(userId);

    socket.emit('loginSuccess', {
      id: userId,
      username: user.username,
      balance: user.balance
    });
  });

  socket.on('reconnect', ({ userId }) => {
    const user = users.get(userId);
    if (user) {
      user.socketId = socket.id;
      socket.join(userId);
      socket.emit('loginSuccess', {
        id: user.id,
        username: user.username,
        balance: user.balance
      });

      const ohlcvSnapshot = {};
      cryptoConfig.forEach(c => {
        ohlcvSnapshot[c.id] = {
          current: candleBuffer[c.id],
          history: ohlcvData[c.id].slice(-120),
        };
      });
      socket.emit('ohlcv', ohlcvSnapshot);

      const userTrades = [];
      for (const [id, trade] of activeTrades) {
        if (trade.userId === userId) {
          userTrades.push(trade);
        }
      }
      socket.emit('activeTrades', userTrades);
    }
  });

  socket.on('placeTrade', ({ userId, asset, direction, amount, duration }) => {
    const user = users.get(userId);
    if (!user) {
      socket.emit('tradeError', { message: 'User not found' });
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      socket.emit('tradeError', { message: 'Invalid amount' });
      return;
    }

    if (tradeAmount > user.balance) {
      socket.emit('tradeError', { message: 'Insufficient balance' });
      return;
    }

    const currentPrice = prices[asset];
    if (!currentPrice) {
      socket.emit('tradeError', { message: 'Invalid asset' });
      return;
    }

    const durationMs = durations[duration] || 60000;

    user.balance -= tradeAmount;

    const trade = {
      id: uuidv4(),
      userId,
      asset,
      direction,
      amount: tradeAmount,
      entryPrice: currentPrice,
      createdAt: Date.now(),
      expiresAt: Date.now() + durationMs,
      duration
    };

    activeTrades.set(trade.id, trade);

    io.to(userId).emit('balanceUpdate', { balance: user.balance });

    socket.emit('tradePlaced', trade);

    io.emit('tradeUpdate', {
      id: trade.id,
      asset: trade.asset,
      direction: trade.direction,
      amount: trade.amount,
      entryPrice: trade.entryPrice,
      duration: trade.duration,
      createdAt: trade.createdAt,
      userId: trade.userId,
      username: user.username
    });
  });

  socket.on('getBalance', ({ userId }) => {
    const user = users.get(userId);
    if (user) {
      socket.emit('balanceUpdate', { balance: user.balance });
    }
  });

  socket.on('getActiveTrades', ({ userId }) => {
    const userTrades = [];
    for (const [id, trade] of activeTrades) {
      if (trade.userId === userId) {
        userTrades.push(trade);
      }
    }
    socket.emit('activeTrades', userTrades);
  });

  socket.on('getHistory', ({ userId }) => {
    socket.emit('tradeHistory', []);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [id, user] of users) {
      if (user.socketId === socket.id) {
        user.socketId = null;
        break;
      }
    }
  });
});

const durations = {
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
};

app.get('/api/prices', (req, res) => {
  res.json(prices);
});

app.get('/api/assets', (req, res) => {
  res.json(cryptoConfig);
});

httpServer.listen(PORT, () => {
  console.log(`Crypto Trading Server running on port ${PORT}`);
});
