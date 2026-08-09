const express = require('express');
const router = express.Router();
const gaming = require('../gaming/gaming-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: gaming.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: gaming });
});

router.get('/games', (req, res) => {
  res.json({ success: true, games: gaming.games });
});
router.get('/characters', (req, res) => {
  res.json({ success: true, characters: gaming.characters });
});
router.get('/consoles', (req, res) => {
  res.json({ success: true, consoles: gaming.consoles });
});
router.get('/esports', (req, res) => {
  res.json({ success: true, esports: gaming.esports });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = gaming.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(gaming.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = gaming.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
