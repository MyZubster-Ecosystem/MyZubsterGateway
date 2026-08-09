const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {
  sendWelcomeEmail,
  sendTokenPurchaseEmail,
  sendBountyCompletedEmail
} = require('../controllers/notificationController');

// POST /api/notifications/welcome/:userId
router.post('/welcome/:userId', sendWelcomeEmail);

// POST /api/notifications/token-purchase
router.post('/token-purchase', sendTokenPurchaseEmail);

// POST /api/notifications/bounty-completed
router.post('/bounty-completed', sendBountyCompletedEmail);

=======
router.get('/', (req, res) => {
  res.json({ notifications: [{ id: 1, message: 'Benvenuto!', read: false, timestamp: new Date().toISOString() }], unread: 1, total: 1 });
});
>>>>>>> origin/main
module.exports = router;
