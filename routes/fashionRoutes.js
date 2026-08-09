const express = require('express');
const router = express.Router();
const fashion = require('../fashion/fashion-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: fashion.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: fashion });
});

router.get('/brands', (req, res) => {
  res.json({ success: true, brands: fashion.brands });
});
router.get('/designers', (req, res) => {
  res.json({ success: true, designers: fashion.designers });
});
router.get('/collections', (req, res) => {
  res.json({ success: true, collections: fashion.collections });
});
router.get('/accessories', (req, res) => {
  res.json({ success: true, accessories: fashion.accessories });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = fashion.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(fashion.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = fashion.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
