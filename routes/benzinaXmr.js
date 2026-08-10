/**
 * BenzinaXMR Routes - #700 Pagamento + #701 Wallet Stazioni
 */
const express = require('express');
const router = express.Router();
const svc = require('../services/benzinaXmrService');

// #700: Pagamento Benzina in XMR
router.post('/calculate', async (req, res) => {
  try { const { liters, fuelType } = req.body; const price = await svc.calculatePrice(liters, fuelType); res.json(price); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/pay', async (req, res) => {
  try { const { stationId, liters, fuelType, licensePlate } = req.body; const payment = await svc.processPayment(stationId, liters, fuelType, licensePlate); res.json(payment); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pay/:id', (req, res) => {
  const p = svc.getPayment(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Payment not found' });
});

router.get('/pay/:id/verify', async (req, res) => {
  try { const result = await svc.verifyPayment(req.params.id); res.json(result); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// #701: Wallet Monero Stazioni
router.post('/stations', (req, res) => {
  try { const { name, location, walletAddress } = req.body; const station = svc.registerStation(name, location, walletAddress); res.json(station); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stations', (req, res) => { res.json(svc.getAllStations()); });

router.get('/stations/:id', (req, res) => {
  const s = svc.getStation(req.params.id);
  s ? res.json(s) : res.status(404).json({ error: 'Station not found' });
});

router.get('/stations/:id/dashboard', (req, res) => {
  const d = svc.getStationDashboard(req.params.id);
  d ? res.json(d) : res.status(404).json({ error: 'Station not found' });
});

router.get('/rate', async (req, res) => {
  try { const rate = await svc.getXmrRate(); res.json({ xmr_eur: rate }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/convert', async (req, res) => {
  try { const { xmr, fuelType } = req.query; const result = await svc.convertXmrToLiters(parseFloat(xmr), fuelType); res.json(result); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/receipt/:id', (req, res) => {
  const r = svc.getReceipt(req.params.id);
  r ? res.json(r) : res.status(404).json({ error: 'Receipt not found' });
});

module.exports = router;
