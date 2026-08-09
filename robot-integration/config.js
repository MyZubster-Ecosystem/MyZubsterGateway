module.exports = {
  // Gateway
  gateway: {
    url: process.env.API_URL || 'http://localhost:5002',
    port: process.env.PORT || 5002,
  },
  
  // Robot
  robot: {
    maxRetries: 3,
    jobTimeout: 24 * 60 * 60 * 1000, // 24 ore
    checkInterval: 30000, // 30 secondi
    paymentConfirmations: 3,
  },
  
  // Monero
  monero: {
    rpcUrl: process.env.MONERO_RPC_URL || 'http://localhost:18081',
    walletRpcUrl: process.env.MONERO_WALLET_RPC_URL || 'http://localhost:18082',
    mainWallet: process.env.MONERO_MAIN_WALLET_ADDRESS,
  },
  
  // Fee
  fees: {
    platform: 0.02, // 2%
    bosco: 0.08,    // 8%
    referral: 0.05, // 5%
  },
  
  // Tari (MYZ)
  tari: {
    swapRate: 12000, // 1 XMR = 12000 MYZ
    minSwap: 0.001,
  }
};
