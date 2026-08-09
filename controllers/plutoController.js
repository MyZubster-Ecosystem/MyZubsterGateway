const PlutoToken = require('../models/PlutoToken');
const TokenBalance = require('../models/TokenBalance');

const createPlutoToken = async (req, res) => {
  try {
    const token = new PlutoToken(req.body);
    await token.save();
    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPlutoTokens = async (req, res) => {
  try {
    const { zone, status } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (status) filter.status = status;
    const tokens = await PlutoToken.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const investInPluto = async (req, res) => {
  try {
    const { tokenId, userId, amount } = req.body;
    const token = await PlutoToken.findById(tokenId);
    if (!token) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }
    let balance = await TokenBalance.findOne({ userId, tokenId });
    if (balance) {
      balance.balance += amount;
    } else {
      balance = new TokenBalance({ userId, tokenId, balance: amount });
    }
    await balance.save();
    token.totalSupply -= amount;
    await token.save();
    res.json({
      success: true,
      data: {
        token: token.symbol,
        zone: token.zone,
        amount: amount,
        newBalance: balance.balance,
        remainingSupply: token.totalSupply
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createPlutoToken, getPlutoTokens, investInPluto };
