const TokenBalance = require('../models/TokenBalance');
const Token = require('../models/Token');

const getWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'utente esista (mock per ora)
    const user = { id: userId || 'test-user-123', username: 'testuser' };
    
    // Ottieni tutti i saldi dei token per l'utente
    const balances = await TokenBalance.find({ userId: user.id });
    
    if (!balances || balances.length === 0) {
      return res.json({
        success: true,
        data: {
          userId: user.id,
          balances: [],
          totalValue: {
            usd: "0.00",
            sgd: "0.00"
          }
        }
      });
    }

    // Ottieni i dettagli dei token separatamente
    const tokenIds = balances.map(b => b.tokenId);
    const tokens = await Token.find({ _id: { $in: tokenIds } }).lean();
    const tokenMap = {};
    tokens.forEach(t => { tokenMap[t._id.toString()] = t; });

    // Calcola il valore totale in USD e SGD
    let totalUSD = 0;
    let totalSGD = 0;

    const formattedBalances = balances.map(b => {
      const token = tokenMap[b.tokenId.toString()];
      if (!token) {
        return null;
      }
      
      const valueUSD = b.balance * (token.tokenPrice || 0);
      const valueSGD = valueUSD * 1.35;
      
      totalUSD += valueUSD;
      totalSGD += valueSGD;

      return {
        tokenId: token._id,
        symbol: token.symbol,
        name: token.name,
        balance: b.balance,
        lockedBalance: b.lockedBalance || 0,
        availableBalance: b.balance - (b.lockedBalance || 0),
        valueUSD: valueUSD.toFixed(2),
        valueSGD: valueSGD.toFixed(2)
      };
    }).filter(b => b !== null);

    res.json({
      success: true,
      data: {
        userId: user.id,
        balances: formattedBalances,
        totalValue: {
          usd: totalUSD.toFixed(2),
          sgd: totalSGD.toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getWalletBalance
};
