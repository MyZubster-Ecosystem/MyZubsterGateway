// routes/benzinaXmr.js - BENZINA-XMR API endpoints
const express = require('express');
const router = express.Router();
const benzinaService = require('../services/benzinaXmrService');
const xmrFuelConversionService = require('../services/xmrFuelConversionService');

// POST /benzina-xmr/pay - Pagamento benzina (#700)
router.post('/pay', async (req, res) => {
  try {
    const { stationId, xmrAmount, fuelType, licensePlate } = req.body;
    if (!stationId || !xmrAmount) {
      return res.status(400).json({ success: false, error: 'stationId e xmrAmount richiesti' });
    }
    const result = await benzinaService.processFuelPayment({ stationId, xmrAmount, fuelType, licensePlate });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/rate - Tassi e prezzi (#700)
router.get('/rate', async (req, res) => {
  try {
    const prices = await benzinaService.getFuelPrices();
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/convert - Converti XMR in litri (#700)
router.get('/convert', async (req, res) => {
  try {
    const xmr = parseFloat(req.query.xmr) || 0;
    const fuel = req.query.fuel || 'benzina';
    const conversion = await xmrFuelConversionService.xmrToLiters(xmr, fuel);
    res.json({ success: true, data: conversion });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/receipt/:id - Ricevuta digitale (#700)
router.get('/receipt/:receiptId', (req, res) => {
  try {
    const receipt = benzinaService.getReceipt(req.params.receiptId);
    if (!receipt) return res.status(404).json({ success: false, error: 'Ricevuta non trovata' });
    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /benzina-xmr/stations - Registra stazione (#701)
router.post('/stations', (req, res) => {
  try {
    const { stationId, stationName } = req.body;
    if (!stationId || !stationName) {
      return res.status(400).json({ success: false, error: 'stationId e stationName richiesti' });
    }
    const wallet = benzinaService.generateStationWallet(stationId, stationName);
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/stations - Lista stazioni (#701)
router.get('/stations', (req, res) => {
  try {
    const list = benzinaService.getAllStations();
    res.json({ success: true, data: list, count: list.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/stations/:id - Dettaglio stazione (#701)
router.get('/stations/:stationId', (req, res) => {
  try {
    const wallet = benzinaService.getStationWallet(req.params.stationId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Stazione non trovata' });
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/stations/:id/dashboard - Dashboard (#701)
router.get('/stations/:stationId/dashboard', (req, res) => {
  try {
    const dashboard = benzinaService.getStationDashboard(req.params.stationId);
    if (!dashboard) return res.status(404).json({ success: false, error: 'Stazione non trovata' });
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /benzina-xmr/qr - Genera QR code (#702)
router.post('/qr', (req, res) => {
  try {
    const { stationId, amount, fuelType } = req.body;
    if (!stationId || !amount) {
      return res.status(400).json({ success: false, error: 'stationId e amount richiesti' });
    }
    const qr = benzinaService.generatePaymentQR({ stationId, amount, fuelType });
    res.json({ success: true, data: qr });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /benzina-xmr/qr/verify/:paymentId - Verifica QR (#702)
router.get('/qr/verify/:paymentId', (req, res) => {
  try {
    const result = benzinaService.verifyQRPayment(req.params.paymentId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
