/**
 * 📊 Dashboard Routes - Gestione Route
 */

const express = require('express');
const router = express.Router();
const { DashboardController } = require('../controllers/dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const dashboardController = new DashboardController();

// Tutte le route richiedono autenticazione
router.use(authenticate);

// Statistiche generali
router.get('/stats', (req, res) => dashboardController.getStats(req, res));

// Lista utenti
router.get('/users', (req, res) => dashboardController.getUsers(req, res));

// Esporta report
router.get('/export', (req, res) => dashboardController.exportReport(req, res));

module.exports = router;
