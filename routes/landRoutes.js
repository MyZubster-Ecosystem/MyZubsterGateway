const express = require('express');
const router = express.Router();
const { createLandToken, getLandTokens, investInLand } = require('../controllers/landController');

router.post('/', createLandToken);
router.get('/', getLandTokens);
router.post('/invest', investInLand);

module.exports = router;
