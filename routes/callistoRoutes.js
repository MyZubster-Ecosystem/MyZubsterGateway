const express = require('express');
const router = express.Router();
const { createCallistoToken, getCallistoTokens, investInCallisto } = require('../controllers/callistoController');

router.post('/', createCallistoToken);
router.get('/', getCallistoTokens);
router.post('/invest', investInCallisto);

module.exports = router;
