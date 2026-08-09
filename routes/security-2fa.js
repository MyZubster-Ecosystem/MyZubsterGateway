// ============================================================
// Security Module Routes — 2FA, Whitelist, Limits API
// Add these routes to the existing routes/security.js file
// ============================================================

const express = require('express');
const router = express.Router();
const TwoFactorService = require('../security/twoFactor');
const WhitelistService = require('../security/whitelist');
const TransactionLimitsService = require('../security/transactionLimits');
const SecurityMiddleware = require('../security/middleware');
const SecurityNotifications = require('../security/securityNotifications');
const auth = require('../middleware/auth'); // Existing auth middleware

// ─── 2FA Endpoints ────────────────────────────────────────

/**
 * POST /api/security/2fa/setup
 * Initialize 2FA for the authenticated user
 * Returns secret + QR code URL
 */
router.post('/2fa/setup', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const email = req.user.email || `${userId}@myzubster`;
    
    const setup = await TwoFactorService.setupTwoFactor(userId, email);
    
    await SecurityNotifications.notify(userId, '2fa_setup_initiated', {});
    
    // Don't return backup codes after setup — they're shown only once
    res.json({
      success: true,
      secret: setup.secret,
      qrUrl: setup.qrUrl,
      message: 'Scan QR code with authenticator app, then verify with POST /api/security/2fa/verify'
    });
  } catch (err) {
    console.error('[2FA Setup]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/security/2fa/verify
 * Verify TOTP token and enable 2FA
 */
router.post('/2fa/verify', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { token } = req.body;
    
    const result = await TwoFactorService.verifyAndEnable(userId, token);
    
    await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TWO_FA_ENABLED, {});
    
    // Return backup codes once
    const TwoFactor = require('../models/TwoFactor');
    const tf = await TwoFactor.findOne({ userId });
    
    res.json({
      success: true,
      enabled: true,
      backupCodes: tf.backupCodes.map(b => b.code),
      message: '2FA enabled. Save backup codes in a safe place!'
    });
  } catch (err) {
    console.error('[2FA Verify]', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/security/2fa/validate
 * Validate a 2FA token (for login flow)
 */
router.post('/2fa/validate', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { token } = req.body;
    
    const result = await TwoFactorService.verifyToken(userId, token);
    
    if (!result.valid) {
      await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TWO_FA_FAILED, {});
      return res.status(403).json({ valid: false, error: 'Invalid token' });
    }
    
    res.json({ valid: true, method: result.method });
  } catch (err) {
    console.error('[2FA Validate]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/security/2fa/disable
 * Disable 2FA (requires valid token)
 */
router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { token } = req.body;
    
    await TwoFactorService.disableTwoFactor(userId, token);
    
    await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TWO_FA_DISABLED, {});
    
    res.json({ success: true, enabled: false });
  } catch (err) {
    console.error('[2FA Disable]', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/security/2fa/status
 * Check 2FA status for current user
 */
router.get('/2fa/status', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const enabled = await TwoFactorService.isEnabled(userId);
    res.json({ enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Whitelist Endpoints ─────────────────────────────────

/**
 * POST /api/security/whitelist
 * Add address to whitelist
 */
router.post('/whitelist', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { address, label, network } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const entry = await WhitelistService.addAddress(userId, address, label, network);
    
    await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.ADDRESS_ADDED, {
      address, network
    });
    
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/security/whitelist/:address
 * Remove address from whitelist
 */
router.delete('/whitelist/:address', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await WhitelistService.removeAddress(userId, req.params.address);
    
    await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.ADDRESS_REMOVED, {
      address: req.params.address
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/security/whitelist
 * List whitelisted addresses
 */
router.get('/whitelist', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const network = req.query.network || null;
    const addresses = await WhitelistService.getAddresses(userId, network);
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Limits Endpoints ────────────────────────────────────

/**
 * GET /api/security/limits
 * Get transaction limits for current user
 */
router.get('/limits', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limits = await TransactionLimitsService.getLimits(userId);
    res.json({
      dailyLimit: limits.dailyLimit,
      perTransactionLimit: limits.perTransactionLimit,
      dailySpent: limits.dailySpent,
      dailyRemaining: limits.dailyLimit - limits.dailySpent,
      require2FAThreshold: limits.require2FAThreshold
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/security/limits
 * Update transaction limits (requires 2FA if enabled)
 */
router.put('/limits', auth, SecurityMiddleware.require2FA, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limits = await TransactionLimitsService.updateLimits(userId, req.body);
    
    await SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.LIMITS_UPDATED, req.body);
    
    res.json({ success: true, limits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Transaction Validation ──────────────────────────────

/**
 * POST /api/security/validate-transaction
 * Pre-flight check before executing a transaction
 */
router.post('/validate-transaction', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { amount, destination, enforceWhitelist } = req.body;
    
    const checks = [];
    
    // Check limits
    if (amount) {
      const limitCheck = await TransactionLimitsService.checkTransaction(userId, amount);
      checks.push({ type: 'limits', ...limitCheck });
    }
    
    // Check whitelist
    if (destination) {
      const wlCheck = await WhitelistService.validateTransaction(userId, destination, { enforceWhitelist });
      checks.push({ type: 'whitelist', ...wlCheck });
    }
    
    // Check 2FA
    const twoFARequired = await TwoFactorService.isEnabled(userId);
    checks.push({ type: '2fa', enabled: twoFARequired });
    
    const allAllowed = checks.every(c => c.type === '2fa' || c.allowed !== false);
    
    res.json({
      allowed: allAllowed,
      checks,
      requires2FA: amount >= 1000 && twoFARequired
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
