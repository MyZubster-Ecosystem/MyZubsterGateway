// Monero Wallet Stub — for Docker Compose development
// Simulates XMR wallet operations (generate address, get balance, send)

const http = require('http');

const PORT = process.env.PORT || 13000;
const DATA_DIR = process.env.WALLET_DATA_DIR || '/data';

// In-memory wallet state
let wallet = {
  address: '4' + Array.from({length: 94}, () => 
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
  ).join(''),
  balance: 500000000000, // 0.5 XMR in atomic units (piconero)
  transactions: []
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Health check
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'monero-wallet-stub' }));
    return;
  }

  // Get wallet info
  if (req.url === '/wallet' || req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify(wallet));
    return;
  }

  // Get balance
  if (req.url === '/balance') {
    res.writeHead(200);
    res.end(JSON.stringify({ balance: wallet.balance, address: wallet.address }));
    return;
  }

  // Send transaction (simulated)
  if (req.url === '/send' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { to, amount } = JSON.parse(body);
        if (amount > wallet.balance) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Insufficient balance' }));
          return;
        }
        wallet.balance -= amount;
        const tx = {
          id: 'xmr_tx_' + Date.now(),
          from: wallet.address,
          to,
          amount,
          timestamp: new Date().toISOString()
        };
        wallet.transactions.push(tx);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, transaction: tx }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Monero Wallet Stub running on port ${PORT}`);
  console.log(`Wallet address: ${wallet.address}`);
});
