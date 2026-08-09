const express = require('express');
const router = express.Router();
const minerals = require('../minerals/minerals-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: minerals.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: minerals });
});

router.get('/preciousMetals', (req, res) => {
  res.json({ success: true, preciousMetals: minerals.preciousMetals });
});
router.get('/gems', (req, res) => {
  res.json({ success: true, gems: minerals.gems });
});
router.get('/rareEarths', (req, res) => {
  res.json({ success: true, rareEarths: minerals.rareEarths });
});
router.get('/industrialMinerals', (req, res) => {
  res.json({ success: true, industrialMinerals: minerals.industrialMinerals });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = minerals.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(minerals.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = minerals.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
