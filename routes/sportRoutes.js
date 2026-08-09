const express = require('express');
const router = express.Router();
const sport = require('../sport/sport-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: sport.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: sport });
});

router.get('/teams', (req, res) => {
  res.json({ success: true, teams: sport.teams });
});
router.get('/athletes', (req, res) => {
  res.json({ success: true, athletes: sport.athletes });
});
router.get('/stadia', (req, res) => {
  res.json({ success: true, stadia: sport.stadia });
});
router.get('/events', (req, res) => {
  res.json({ success: true, events: sport.events });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = sport.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(sport.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = sport.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
