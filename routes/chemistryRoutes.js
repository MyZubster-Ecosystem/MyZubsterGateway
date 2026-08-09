const express = require('express');
const router = express.Router();
const chemistry = require('../chemistry/chemistry-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: chemistry.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: chemistry });
});

router.get('/elements', (req, res) => {
  res.json({ success: true, elements: chemistry.elements });
});
router.get('/compounds', (req, res) => {
  res.json({ success: true, compounds: chemistry.compounds });
});
router.get('/molecules', (req, res) => {
  res.json({ success: true, molecules: chemistry.molecules });
});
router.get('/reactions', (req, res) => {
  res.json({ success: true, reactions: chemistry.reactions });
});
router.get('/materials', (req, res) => {
  res.json({ success: true, materials: chemistry.materials });
});
router.get('/discoveries', (req, res) => {
  res.json({ success: true, discoveries: chemistry.discoveries });
});
router.get('/nobelPrizes', (req, res) => {
  res.json({ success: true, nobelPrizes: chemistry.nobelPrizes });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = chemistry.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(chemistry.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = chemistry.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
