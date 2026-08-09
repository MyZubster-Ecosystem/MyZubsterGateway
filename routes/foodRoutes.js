const express = require('express');
const router = express.Router();
const food = require('../food/food-tokenization');

// ---- GET endpoints ----
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: food.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, data: food });
});

router.get('/recipes', (req, res) => {
  res.json({ success: true, recipes: food.recipes });
});
router.get('/restaurants', (req, res) => {
  res.json({ success: true, restaurants: food.restaurants });
});
router.get('/chefs', (req, res) => {
  res.json({ success: true, chefs: food.chefs });
});
router.get('/wines', (req, res) => {
  res.json({ success: true, wines: food.wines });
});

// ---- NFT Minting endpoints ----
router.post('/mint/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }
  const result = food.mintNFT(type, itemId);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/nfts', (req, res) => {
  res.json(food.getAllNFTs());
});

router.get('/nft/:nftId', (req, res) => {
  const result = food.getNFT(req.params.nftId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
