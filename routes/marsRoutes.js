const express = require('express');
const router = express.Router();
const { createMarsToken, getMarsTokens, investInMars } = require('../controllers/marsController');

router.post('/', createMarsToken);
router.get('/', getMarsTokens);
router.post('/invest', investInMars);

module.exports = router;
