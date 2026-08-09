const express = require('express');
const router = express.Router();
const music = require('../music/music-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: music.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, music });
});

router.get('/artists', (req, res) => { res.json({ success: true, artists: music.artists }); });
router.get('/albums', (req, res) => { res.json({ success: true, albums: music.albums }); });
router.get('/songs', (req, res) => { res.json({ success: true, songs: music.songs }); });
router.get('/instruments', (req, res) => { res.json({ success: true, instruments: music.instruments }); });

module.exports = router;
