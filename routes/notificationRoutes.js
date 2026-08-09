const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  res.json({ notifications: [{ id: 1, message: 'Benvenuto!', read: false, timestamp: new Date().toISOString() }], unread: 1, total: 1 });
});
module.exports = router;
