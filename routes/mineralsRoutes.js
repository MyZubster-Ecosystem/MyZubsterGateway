const express = require('express');
const router = express.Router();
const minerals = require('../minerals/minerals-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: minerals.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, minerals });
});

router.get('/precious', (req, res) => {
  res.json({ success: true, precious: minerals.precious });
});

router.get('/gemstones', (req, res) => {
  res.json({ success: true, gemstones: minerals.gemstones });
});

router.get('/rare-earth', (req, res) => {
  res.json({ success: true, rare_earth: minerals.rare_earth });
});

router.get('/industrial', (req, res) => {
  res.json({ success: true, industrial: minerals.industrial });
});


// POST /api/minerals/mint/precious/:id
router.post('/mint/precious/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = minerals.precious;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'precious not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'precious item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-MINERALS-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/minerals/mint/gemstones/:id
router.post('/mint/gemstones/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = minerals.gemstones;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'gemstones not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'gemstones item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-MINERALS-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/minerals/mint/rare_earth/:id
router.post('/mint/rare_earth/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = minerals.rare_earth;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'rare_earth not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'rare_earth item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-MINERALS-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/minerals/mint/industrial/:id
router.post('/mint/industrial/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = minerals.industrial;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'industrial not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'industrial item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-MINERALS-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
