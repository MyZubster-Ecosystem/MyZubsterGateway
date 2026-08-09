const express = require('express');
const router = express.Router();
const { createGanymedeToken, getGanymedeTokens, investInGanymede } = require('../controllers/ganymedeController');

router.post('/', createGanymedeToken);
router.get('/', getGanymedeTokens);
router.post('/invest', investInGanymede);

module.exports = router;
