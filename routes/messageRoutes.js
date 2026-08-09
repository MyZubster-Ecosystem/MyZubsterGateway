const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  res.json({ messages: [{ id: 1, from: 'system', subject: 'Benvenuto', body: 'Grazie per esserti unito!', timestamp: new Date().toISOString() }], total: 1, unread: 1 });
});
module.exports = router;
