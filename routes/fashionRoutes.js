const express = require('express');
const router = express.Router();
const fashion = require('../fashion/fashion-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: fashion.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, fashion });
});

router.get('/brands', (req, res) => { res.json({ success: true, brands: fashion.brands }); });
router.get('/designers', (req, res) => { res.json({ success: true, designers: fashion.designers }); });
router.get('/collections', (req, res) => { res.json({ success: true, collections: fashion.collections }); });
router.get('/accessories', (req, res) => { res.json({ success: true, accessories: fashion.accessories }); });

module.exports = router;
