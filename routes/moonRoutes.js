const express = require('express');
const router = express.Router();
const { createMoonToken, getMoonTokens, investInMoon } = require('../controllers/moonController');

router.post('/', createMoonToken);
router.get('/', getMoonTokens);
router.post('/invest', investInMoon);

module.exports = router;
