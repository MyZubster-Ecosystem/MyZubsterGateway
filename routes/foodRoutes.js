const express = require('express');
const router = express.Router();
const food = require('../food/food-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: food.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, food });
});

router.get('/recipes', (req, res) => { res.json({ success: true, recipes: food.recipes }); });
router.get('/restaurants', (req, res) => { res.json({ success: true, restaurants: food.restaurants }); });
router.get('/chefs', (req, res) => { res.json({ success: true, chefs: food.chefs }); });
router.get('/wines', (req, res) => { res.json({ success: true, wines: food.wines }); });

module.exports = router;
