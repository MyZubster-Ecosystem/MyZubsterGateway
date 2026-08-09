const express = require('express');
const router = express.Router();
const { createEuropaToken, getEuropaTokens, investInEuropa } = require('../controllers/europaController');

router.post('/', createEuropaToken);
router.get('/', getEuropaTokens);
router.post('/invest', investInEuropa);

module.exports = router;
