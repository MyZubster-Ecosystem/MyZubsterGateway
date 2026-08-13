/**
 * 🎯 Bounty Routes - Gestione Route
 */

const express = require('express');
const router = express.Router();
const { BountyController } = require('../controllers/bounty.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const bountyController = new BountyController();

// Tutte le route richiedono autenticazione
router.use(authenticate);

// Route pubbliche (lettura)
router.get('/', (req, res) => bountyController.getBounties(req, res));
router.get('/stats', (req, res) => bountyController.getBountyStats(req, res));
router.get('/:id', (req, res) => bountyController.getBounty(req, res));

// Route protette (solo admin e bounty managers)
router.post('/', authorize('admin', 'bounty_manager'), (req, res) => bountyController.createBounty(req, res));
router.put('/:id/assign', authorize('admin', 'bounty_manager'), (req, res) => bountyController.assignBounty(req, res));
router.put('/:id/status', (req, res) => bountyController.updateBountyStatus(req, res));
router.post('/:id/comments', (req, res) => bountyController.addComment(req, res));

module.exports = router;
