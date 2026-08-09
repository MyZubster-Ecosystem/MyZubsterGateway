const express = require('express');
const router = express.Router();
const { createEnceladusToken, getEnceladusTokens, investInEnceladus } = require('../controllers/enceladusController');

router.post('/', createEnceladusToken);
router.get('/', getEnceladusTokens);
router.post('/invest', investInEnceladus);

module.exports = router;
