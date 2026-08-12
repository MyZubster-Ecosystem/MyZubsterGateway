/**
 * GitHub Webhook Route — Bounty B3 / #236
 *
 * Endpoint: POST /webhook/github
 * Listens for pull_request events (merged), verifies HMAC signature,
 * and auto-creates a bounty assigned to the PR contributor.
 */

const crypto = require('crypto');
const logger = require('../logger');

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'myzubster-webhook-secret-change-me';

/**
 * In-memory bounty store (replace with DB in production).
 * Structure: { contributor: { pr_number, merged_at, bounty_id } }
 */
const bountyLedger = new Map();

/**
 * Verify GitHub webhook HMAC signature.
 */
function verifySignature(payload, signature) {
  if (!signature) return false;
  const computed = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Extract relevant fields from a GitHub pull_request event payload.
 */
function extractPRInfo(body) {
  const action = body.action;
  const pr = body.pull_request || {};
  const merged = body.action === 'closed' && pr.merged === true;
  return {
    action,
    merged,
    prNumber: pr.number || null,
    contributor: (pr.user && pr.user.login) || null,
    title: pr.title || '',
    htmlUrl: pr.html_url || '',
    mergedAt: pr.merged_at || null,
    repoName: (body.repository && body.repository.full_name) || ''
  };
}

/**
 * Assign a bounty to the contributor and log it.
 */
function assignBounty(info) {
  const bountyId = `B3-${info.prNumber}-${Date.now()}`;
  const record = {
    bountyId,
    contributor: info.contributor,
    prNumber: info.prNumber,
    prTitle: info.title,
    prUrl: info.htmlUrl,
    mergedAt: info.mergedAt,
    assignedAt: new Date().toISOString(),
    status: 'assigned'
  };
  bountyLedger.set(bountyId, record);
  return record;
}

/**
 * Express router.
 */
const router = require('express').Router();

router.post('/github', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const eventType = req.headers['x-github-event'];
  const rawBody = JSON.stringify(req.body);

  // Only handle pull_request events
  if (eventType !== 'pull_request') {
    logger.info(`[webhook] Ignored event: ${eventType}`);
    return res.status(200).json({ ok: true, ignored: true, reason: `event ${eventType} not processed` });
  }

  // Verify HMAC
  if (!verifySignature(rawBody, signature)) {
    logger.warn('[webhook] Invalid signature');
    return res.status(401).json({ ok: false, error: 'Invalid signature' });
  }

  // Extract PR info
  const info = extractPRInfo(req.body);

  logger.info(`[webhook] ${info.action} PR#${info.prNumber} by ${info.contributor} merged=${info.merged}`);

  // Only act on merged PRs
  if (!info.merged) {
    logger.info(`[webhook] PR#${info.prNumber} not merged (action=${info.action}), skipping`);
    return res.status(200).json({ ok: true, action: info.action, merged: false });
  }

  if (!info.contributor) {
    logger.warn('[webhook] Missing contributor, cannot assign bounty');
    return res.status(400).json({ ok: false, error: 'Missing contributor' });
  }

  // Assign bounty
  const bounty = assignBounty(info);
  logger.info(`[webhook] BOUNTY ASSIGNED: ${bounty.bountyId} → ${info.contributor} (PR#${info.prNumber})`);

  res.status(200).json({
    ok: true,
    action: 'bounty_assigned',
    bounty
  });
});

// Health / status endpoint
router.get('/github/status', (req, res) => {
  const entries = Array.from(bountyLedger.values());
  res.json({
    ok: true,
    totalAssigned: entries.length,
    recent: entries.slice(-10).reverse()
  });
});

module.exports = router;
