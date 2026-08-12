/**
 * Webhook Model — Bounty P6 / #270
 * Stores registered webhook URLs and delivers event notifications.
 */

const crypto = require('crypto');

class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.retryConfig = {
      maxRetries: 5,
      baseDelayMs: 1000,
      maxDelayMs: 60000,
      timeoutMs: 10000
    };
  }

  /**
   * Register a new webhook URL.
   * @param {string} userId - Owner user ID
   * @param {string} url - Target URL for POST notifications
   * @param {string[]} events - List of events to subscribe to (e.g., ['job.created', 'job.completed'])
   * @param {string} secret - Optional HMAC secret for payload signing
   * @returns {{ id: string, url: string, events: string[], createdAt: string }}
   */
  register(userId, url, events = ['job.created', 'job.completed', 'job.disputed'], secret = null) {
    if (!userId || !url) {
      throw new Error('userId and url are required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      throw new Error(`Invalid webhook URL: ${url}`);
    }

    const id = crypto.randomUUID();
    const webhook = {
      id,
      userId,
      url,
      events,
      secret: secret || crypto.randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      deliveryStats: {
        total: 0,
        success: 0,
        failed: 0,
        lastDelivery: null
      }
    };

    this.webhooks.set(id, webhook);
    console.log(`[Webhook] Registered webhook ${id} for user ${userId} → ${url}`);
    return webhook;
  }

  /**
   * Unregister a webhook.
   */
  unregister(id) {
    if (!this.webhooks.has(id)) {
      throw new Error(`Webhook ${id} not found`);
    }
    this.webhooks.delete(id);
    return { id, removed: true };
  }

  /**
   * List webhooks for a user.
   */
  listByUser(userId) {
    const hooks = [];
    for (const [id, wh] of this.webhooks) {
      if (wh.userId === userId) {
        hooks.push({ id, url: wh.url, events: wh.events, active: wh.active, stats: wh.deliveryStats });
      }
    }
    return hooks;
  }

  /**
   * Get webhooks subscribed to a specific event.
   */
  getSubscribers(event) {
    const subs = [];
    for (const [id, wh] of this.webhooks) {
      if (wh.active && wh.events.includes(event)) {
        subs.push({ id, url: wh.url, secret: wh.secret });
      }
    }
    return subs;
  }

  /**
   * Build HMAC signature for webhook payload.
   */
  signPayload(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Deliver an event to all subscribed webhooks with retry+backoff.
   * @param {string} event - Event name (e.g., 'job.created')
   * @param {object} data - Event payload
   * @returns {Promise<{delivered: number, failed: number, results: object[]}>}
   */
  async deliver(event, data) {
    const subscribers = this.getSubscribers(event);
    if (subscribers.length === 0) {
      console.log(`[Webhook] No subscribers for event: ${event}`);
      return { delivered: 0, failed: 0, results: [] };
    }

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const results = [];
    let delivered = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const result = await this._deliverToUrl(sub.url, payload, sub.secret, sub.id);
      results.push(result);
      if (result.success) delivered++;
      else failed++;
    }

    console.log(`[Webhook] Delivered ${event}: ${delivered} success, ${failed} failed (${subscribers.length} total)`);
    return { delivered, failed, results };
  }

  /**
   * Deliver payload to a single URL with retry + exponential backoff.
   */
  async _deliverToUrl(url, payload, secret, webhookId) {
    const signature = this.signPayload(payload, secret);
    const body = JSON.stringify(payload);

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this._httpPost(url, body, signature);
        if (response.status >= 200 && response.status < 300) {
          this._updateStats(webhookId, true);
          return { url, success: true, status: response.status, attempt };
        }
        // Non-2xx: retry
        console.warn(`[Webhook] ${url} returned ${response.status} (attempt ${attempt + 1})`);
      } catch (err) {
        console.warn(`[Webhook] Delivery failed to ${url}: ${err.message} (attempt ${attempt + 1})`);
      }

      if (attempt < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.baseDelayMs * Math.pow(2, attempt),
          this.retryConfig.maxDelayMs
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this._updateStats(webhookId, false);
    return { url, success: false, status: null, attempt: this.retryConfig.maxRetries + 1 };
  }

  /**
   * HTTP POST with timeout.
   */
  _httpPost(url, body, signature) {
    return new Promise((resolve, reject) => {
      const { hostname, port, pathname } = new URL(url);
      const http = url.startsWith('https') ? require('https') : require('http');

      const options = {
        hostname,
        port: port || (url.startsWith('https') ? 443 : 80),
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-Webhook-Signature': signature,
          'X-Event-Timestamp': new Date().toISOString(),
          'User-Agent': 'MyZubsterGateway-Webhook/1.0'
        },
        timeout: this.retryConfig.timeoutMs
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Webhook delivery timeout'));
      });

      req.write(body);
      req.end();
    });
  }

  _updateStats(webhookId, success) {
    const wh = this.webhooks.get(webhookId);
    if (!wh) return;
    wh.deliveryStats.total++;
    if (success) wh.deliveryStats.success++;
    else wh.deliveryStats.failed++;
    wh.deliveryStats.lastDelivery = new Date().toISOString();
  }

  /**
   * Get delivery statistics.
   */
  getStats() {
    let total = 0, success = 0, failed = 0;
    for (const [, wh] of this.webhooks) {
      total += wh.deliveryStats.total;
      success += wh.deliveryStats.success;
      failed += wh.deliveryStats.failed;
    }
    return { totalWebhooks: this.webhooks.size, totalDeliveries: total, success, failed };
  }
}

// Singleton instance
const webhookManager = new WebhookManager();

module.exports = { WebhookManager, webhookManager };
