const express = require('express');
const router = express.Router();
const { createPlutoToken, getPlutoTokens, investInPluto } = require('../controllers/plutoController');

router.post('/', createPlutoToken);
router.get('/', getPlutoTokens);
router.post('/invest', investInPluto);

module.exports = router;
