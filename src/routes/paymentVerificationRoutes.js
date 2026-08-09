const express = require('express');
const router = express.Router();
const pvc = require('../controllers/paymentVerificationController');
const jwt = require('jsonwebtoken');
const { translateRequest } = require('../../config/apiMessages');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res
      .status(401)
      .json({ error: translateRequest(req, 'auth.tokenRequired') });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (e) {
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

router.post('/', auth, pvc.createVerification);
router.get('/', pvc.listVerifications);
router.get('/stats', auth, admin, pvc.getStats);
router.get('/:verificationId', pvc.getVerification);
router.post('/:verificationId/confirmations', auth, pvc.updateConfirmations);
router.post('/:verificationId/anomaly-check', auth, pvc.runAnomalyCheck);
router.get('/:verificationId/report', pvc.getReport);

module.exports = router;
