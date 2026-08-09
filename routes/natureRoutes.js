const express = require('express');
const router = express.Router();
const nature = require('../nature/nature-tokenization');

// ---- GET endpoints (existing) ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: nature.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, nature });
});

router.get('/animals', (req, res) => {
  res.json({ success: true, animals: nature.animals });
});

router.get('/plants', (req, res) => {
  res.json({ success: true, plants: nature.plants });
});

router.get('/ecosystems', (req, res) => {
  res.json({ success: true, ecosystems: nature.ecosystems });
});

router.get('/conservation', (req, res) => {
  res.json({ success: true, conservation: nature.conservation });
});

// ---- NFT Minting endpoints (NEW for bounty #1224) ----
// POST /api/nature/mint/animal/:id
router.post('/mint/animal/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const animal = nature.animals.find(a => a.id === id);
    if (!animal) return res.status(404).json({ success: false, error: 'Animal not found' });
    
    const nft = nature.mintNFT('animal', animal, req.body.wallet || 'anonymous');
    res.json({ success: true, nft, message: `NFT minted: ${animal.name}` });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/nature/mint/plant/:id
router.post('/mint/plant/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const plant = nature.plants.find(p => p.id === id);
    if (!plant) return res.status(404).json({ success: false, error: 'Plant not found' });
    
    const nft = nature.mintNFT('plant', plant, req.body.wallet || 'anonymous');
    res.json({ success: true, nft, message: `NFT minted: ${plant.name}` });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/nature/mint/ecosystem/:id
router.post('/mint/ecosystem/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eco = nature.ecosystems.find(e => e.id === id);
    if (!eco) return res.status(404).json({ success: false, error: 'Ecosystem not found' });
    
    const nft = nature.mintNFT('ecosystem', eco, req.body.wallet || 'anonymous');
    res.json({ success: true, nft, message: `NFT minted: ${eco.name}` });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/nature/mint/conservation/:id
router.post('/mint/conservation/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const area = nature.conservation.find(c => c.id === id);
    if (!area) return res.status(404).json({ success: false, error: 'Conservation area not found' });
    
    const nft = nature.mintNFT('conservation', area, req.body.wallet || 'anonymous');
    res.json({ success: true, nft, message: `NFT minted: ${area.name}` });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/nature/nfts/:wallet — list minted NFTs per wallet
router.get('/nfts/:wallet', (req, res) => {
  const nfts = nature.getNFTsByWallet(req.params.wallet);
  res.json({ success: true, wallet: req.params.wallet, nfts, count: nfts.length });
});

// POST /api/nature/batch-mint — mint entire category
router.post('/batch-mint/:category', (req, res) => {
  try {
    const category = req.params.category;
    if (!['animals', 'plants', 'ecosystems', 'conservation'].includes(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category. Use: animals, plants, ecosystems, conservation' });
    }
    const wallet = req.body.wallet || 'anonymous';
    const nfts = nature.batchMint(category, wallet);
    res.json({ success: true, category, nfts, count: nfts.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
