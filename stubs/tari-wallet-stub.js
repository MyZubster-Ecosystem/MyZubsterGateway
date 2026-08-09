// Tari Wallet Stub — for Docker Compose development
// Simulates MYZ wallet operations (generate address, get balance, send)

const http = require('http');

const PORT = process.env.PORT || 12000;
const DATA_DIR = process.env.WALLET_DATA_DIR || '/data';

// In-memory wallet state
let wallet = {
  address: 'MYZ' + Math.random().toString(36).substring(2, 15),
  balance: 1000000, // 1 MYZ in atomic units
  transactions: []
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Health check
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'tari-wallet-stub' }));
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
          id: 'tx_' + Date.now(),
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
  console.log(`Tari Wallet Stub running on port ${PORT}`);
  console.log(`Wallet address: ${wallet.address}`);
});
