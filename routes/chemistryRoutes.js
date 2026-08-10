const express = require('express');
const router = express.Router();
const chemistry = require('../chemistry/chemistry-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: chemistry.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, chemistry });
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

router.get('/nobel', (req, res) => {
  res.json({ success: true, nobel: chemistry.nobel });
});


// POST /api/chemistry/mint/elements/:id
router.post('/mint/elements/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.elements;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'elements not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'elements item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/compounds/:id
router.post('/mint/compounds/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.compounds;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'compounds not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'compounds item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/molecules/:id
router.post('/mint/molecules/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.molecules;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'molecules not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'molecules item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/reactions/:id
router.post('/mint/reactions/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.reactions;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'reactions not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'reactions item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/materials/:id
router.post('/mint/materials/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.materials;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'materials not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'materials item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/discoveries/:id
router.post('/mint/discoveries/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.discoveries;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'discoveries not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'discoveries item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chemistry/mint/nobel/:id
router.post('/mint/nobel/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = chemistry.nobel;
    if (!items || !Array.isArray(items)) return res.status(404).json({ success: false, error: 'nobel not found' });
    const item = items.find(i => i.id === id || items.indexOf(i) === id - 1);
    if (!item) return res.status(404).json({ success: false, error: 'nobel item not found' });
    const wallet = req.body.wallet || 'anonymous';
    const nftId = item.tokenId || ('NFT-CHEMISTRY-' + Date.now());
    res.json({ success: true, nft: { id: nftId, item, wallet, mintedAt: new Date().toISOString() }, message: 'NFT minted: ' + (item.name || item.symbol || 'Item') });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
