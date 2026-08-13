const express = require('express');
const router = express.Router();
const { GamificationController } = require('../controllers/gamification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const controller = new GamificationController();

router.use(authenticate);
router.get('/profile', (req, res) => controller.getUserProfile(req, res));
router.get('/leaderboard', (req, res) => controller.getLeaderboard(req, res));
router.get('/achievements', (req, res) => controller.getAchievements(req, res));

module.exports = router;
