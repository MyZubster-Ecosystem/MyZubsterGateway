const express = require('express');
const router = express.Router();
const wc = require('../controllers/walletController');
const jwt = require('jsonwebtoken');
const { translateRequest } = require('../../config/apiMessages');
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res
      .status(401)
      .json({ error: translateRequest(req, 'auth.tokenRequired') });
  }
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret'); next(); }
  catch (e) {
    return res
      .status(401)
      .json({ error: translateRequest(req, 'auth.invalidToken') });
  }
};
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: translateRequest(req, 'admin.required') });
  }
  next();
};
router.get('/:userId', auth, wc.getWallet);
router.get('/:userId/transactions', wc.getTransactions);
router.get('/:userId/dashboard', auth, wc.getPaymentDashboard);
router.get('/:userId/trends', auth, wc.getPaymentTrends);
router.get('/:userId/alerts', auth, wc.getAlerts);
router.post('/:userId/alerts/:alertId/read', auth, wc.markAlertRead);
router.post('/deposit', auth, wc.deposit);
router.post('/withdraw', auth, wc.withdraw);
router.post('/transfer', auth, wc.transfer);
router.get('/stats/all', auth, admin, wc.getStats);
module.exports = router;
