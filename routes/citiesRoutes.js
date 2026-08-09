const express = require('express');
const router = express.Router();
const cities = require('../cities/cities-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: cities.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: cities });
});

router.get('/landmarks', (req, res) => {
  res.json({ success: true, landmarks: cities.landmarks });
});
router.get('/fountains', (req, res) => {
  res.json({ success: true, fountains: cities.fountains });
});
router.get('/squares', (req, res) => {
  res.json({ success: true, squares: cities.squares });
});
router.get('/buildings', (req, res) => {
  res.json({ success: true, buildings: cities.buildings });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = cities.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(cities.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = cities.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
