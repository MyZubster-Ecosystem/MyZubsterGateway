const express = require('express');
const router = express.Router();
const { createTitanToken, getTitanTokens, investInTitan } = require('../controllers/titanController');

router.post('/', createTitanToken);
router.get('/', getTitanTokens);
router.post('/invest', investInTitan);

module.exports = router;
