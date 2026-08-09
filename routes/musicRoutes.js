const express = require('express');
const router = express.Router();
const music = require('../music/music-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: music.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: music });
});

router.get('/artists', (req, res) => {
  res.json({ success: true, artists: music.artists });
});
router.get('/albums', (req, res) => {
  res.json({ success: true, albums: music.albums });
});
router.get('/songs', (req, res) => {
  res.json({ success: true, songs: music.songs });
});
router.get('/instruments', (req, res) => {
  res.json({ success: true, instruments: music.instruments });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = music.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(music.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = music.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
