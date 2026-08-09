const express = require('express');
const router = express.Router();
const { createCeresToken, getCeresTokens, investInCeres } = require('../controllers/ceresController');

router.post('/', createCeresToken);
router.get('/', getCeresTokens);
router.post('/invest', investInCeres);

module.exports = router;
