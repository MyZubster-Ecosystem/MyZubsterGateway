const express = require('express');
const router = express.Router();
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');

// POST /api/messages - Invia un messaggio
router.post('/', sendMessage);

// GET /api/messages/:userId1/:userId2 - Ottieni messaggi tra due utenti
router.get('/:userId1/:userId2', getMessages);

// GET /api/messages/conversations/:userId - Ottieni conversazioni di un utente
router.get('/conversations/:userId', getConversations);

// PUT /api/messages/read - Segna messaggi come letti
router.put('/read', markAsRead);

// DELETE /api/messages/:messageId - Elimina un messaggio
router.delete('/:messageId', deleteMessage);

<<<<<<< HEAD
=======
=======
router.get('/', (req, res) => {
  res.json({ messages: [{ id: 1, from: 'system', subject: 'Benvenuto', body: 'Grazie per esserti unito!', timestamp: new Date().toISOString() }], total: 1, unread: 1 });
});
>>>>>>> origin/main
>>>>>>> origin/main
module.exports = router;
