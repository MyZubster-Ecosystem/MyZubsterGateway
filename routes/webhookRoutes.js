const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'iHNQCkOh1ImpkGGVghXorPTzrZSPNc/ZYNdg4vroB9s=';

const verifySignature = (req) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

// Endpoint webhook per GitHub
router.post('/github', (req, res) => {
  // Verifica la firma (se il secret è configurato)
  if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'iHNQCkOh1ImpkGGVghXorPTzrZSPNc/ZYNdg4vroB9s=') {
    if (!verifySignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }
  
  const event = req.headers['x-github-event'];
  const delivery = req.headers['x-github-delivery'];
  
  console.log(`📥 Webhook ricevuto: ${event} (${delivery})`);
  
  // Gestisci eventi
  if (event === 'issue_comment') {
    const { action, issue, comment } = req.body;
    console.log(`💬 Commento ${action} su #${issue.number}: ${comment.body?.substring(0, 50)}...`);
    
    if (action === 'created' && comment.body?.includes('/claim')) {
      console.log(`🔍 Claim rilevato su #${issue.number} da @${comment.user.login}`);
      // Qui puoi attivare il processamento
    }
  }
  
  if (event === 'issues') {
    const { action, issue } = req.body;
    console.log(`📝 Issue ${action}: #${issue.number} - ${issue.title}`);
  }
  
  if (event === 'pull_request') {
    const { action, pull_request } = req.body;
    console.log(`🔀 PR ${action}: #${pull_request.number}`);
  }
  
  res.status(200).json({ received: true, event });
});

// Health check per il webhook
router.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'webhook' });
});

module.exports = router;
