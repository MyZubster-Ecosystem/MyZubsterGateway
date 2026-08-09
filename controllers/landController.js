const LandToken = require('../models/LandToken');
const TokenBalance = require('../models/TokenBalance');

// Crea un nuovo token della terra
const createLandToken = async (req, res) => {
  try {
    const token = new LandToken(req.body);
    await token.save();
    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Ottieni tutti i token della terra
const getLandTokens = async (req, res) => {
  try {
    const { type, country, status } = req.query;
    const filter = {};
    if (type) filter.assetType = type;
    if (country) filter['location.country'] = country;
    if (status) filter.status = status;
    
    const tokens = await LandToken.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Investi in un token della terra
const investInLand = async (req, res) => {
  try {
    const { tokenId, userId, amount } = req.body;
    
    const token = await LandToken.findById(tokenId);
    if (!token) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }
    
    // Crea o aggiorna il balance
    let balance = await TokenBalance.findOne({ userId, tokenId });
    if (balance) {
      balance.balance += amount;
    } else {
      balance = new TokenBalance({ userId, tokenId, balance: amount });
    }
    await balance.save();
    
    // Aggiorna la fornitura del token
    token.totalSupply -= amount;
    await token.save();
    
    res.json({
      success: true,
      data: {
        token: token.symbol,
        amount: amount,
        newBalance: balance.balance,
        remainingSupply: token.totalSupply
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createLandToken, getLandTokens, investInLand };
