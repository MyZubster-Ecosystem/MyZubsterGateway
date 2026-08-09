/**
 * Payment Gateway MYZ/XMR con escrow (Closes #382)
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const payments = new Map();
const disputes = new Map();

function genWallet(cur) { return (cur === 'MYZ' ? 'MYZ_' : 'XMR_') + crypto.randomBytes(16).toString('hex'); }
function genPayId() { return 'PAY-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex'); }

// POST /api/payments/generate
router.post('/generate', (req, res) => {
  const { amount, currency, clientId, description } = req.body;
  if (!amount || !currency || !clientId) {
    return res.status(400).json({ error: 'amount, currency, clientId required' });
  }
  const cur = currency.toUpperCase();
  if (!['MYZ','XMR'].includes(cur)) return res.status(400).json({ error: 'currency must be MYZ or XMR' });

  const pid = genPayId();
  const wallet = genWallet(cur);
  const expires = new Date(Date.now() + 30*60000).toISOString();
  const pay = { paymentId: pid, walletAddress: wallet, currency: cur, amount: parseFloat(amount), clientId, description: description || '', status: 'pending', createdAt: new Date().toISOString(), expiresAt: expires, transactions: [] };
  payments.set(pid, pay);
  res.status(201).json({ success: true, paymentId: pid, walletAddress: wallet, currency: cur, amount: parseFloat(amount), expiresAt: expires, message: `Send ${amount} ${cur} to ${wallet} within 30 min` });
});

// POST /webhook/payment
router.post('/webhook', (req, res) => {
  const { paymentId, txHash, amount, currency } = req.body;
  if (!paymentId || !txHash) return res.status(400).json({ error: 'paymentId, txHash required' });
  const pay = payments.get(paymentId);
  if (!pay) return res.status(404).json({ error: 'payment not found' });
  if (new Date() > new Date(pay.expiresAt)) { pay.status = 'expired'; payments.set(paymentId, pay); return res.status(410).json({ error: 'expired', payment: pay }); }
  pay.status = 'confirmed'; pay.txHash = txHash; pay.confirmedAt = new Date().toISOString();
  pay.transactions.push({ txHash, amount: parseFloat(amount) || pay.amount, currency: currency || pay.currency, timestamp: new Date().toISOString() });
  payments.set(paymentId, pay);
  res.json({ success: true, paymentId, status: 'confirmed', txHash });
});

// GET /api/payments/status/:id
router.get('/status/:paymentId', (req, res) => {
  const pay = payments.get(req.params.paymentId);
  if (!pay) return res.status(404).json({ error: 'not found' });
  res.json(pay);
});

// POST /api/payments/refund
router.post('/refund', (req, res) => {
  const { paymentId, reason } = req.body;
  if (!paymentId || !reason) return res.status(400).json({ error: 'paymentId, reason required' });
  const pay = payments.get(paymentId);
  if (!pay) return res.status(404).json({ error: 'not found' });
  if (pay.status !== 'confirmed') return res.status(400).json({ error: 'only confirmed payments can be refunded' });
  const did = 'DSP-' + Date.now();
  const dispute = { disputeId: did, paymentId, reason, status: 'open', createdAt: new Date().toISOString(), payment: { ...pay } };
  pay.status = 'disputed';
  disputes.set(did, dispute);
  payments.set(paymentId, pay);
  res.status(201).json({ success: true, disputeId: did, paymentId, status: 'disputed', message: 'Dispute opened. Refund after review.' });
});

// GET /api/payments/disputes
router.get('/disputes', (req, res) => {
  const list = [...disputes.entries()].map(([id,d]) => ({ disputeId: id, ...d }));
  res.json({ total: list.length, disputes: list });
});

// GET /api/payments/list
router.get('/list', (req, res) => {
  const list = [...payments.entries()].map(([id,p]) => ({ paymentId: id, ...p }));
  list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ total: list.length, payments: list.slice(0, parseInt(req.query.limit)||20) });
});

module.exports = router;
