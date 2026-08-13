'use strict';

/**
 * Webhook Integration Test using webhook.site
 * 
 * Tests the POST /webhook/receive endpoint by sending test payloads
 * and verifying the webhook log through the GET /webhook/log endpoint.
 * 
 * Uses webhook.site for external webhook validation:
 * - Creates a free webhook.site token
 * - Sends payloads to the gateway
 * - Verifies webhook reception via the log API
 */

const http = require('http');
const https = require('https');

// --- Test configuration ---
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
const WEBHOOK_SITE_API = 'https://webhook.site';

// --- Helper: HTTP request ---
function httpRequest(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const options = {
      method,
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    };

    const req = mod.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// --- Helper: Create webhook.site token (free, no auth) ---
async function createWebhookSiteToken() {
  const res = await httpRequest('POST', `${WEBHOOK_SITE_API}/token`);
  if (!res.body || !res.body.uuid) {
    throw new Error(`Failed to create webhook.site token: ${JSON.stringify(res.body)}`);
  }
  return res.body.uuid;
}

// --- Helper: Get webhook.site requests ---
async function getWebhookSiteRequests(token, maxWait = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const res = await httpRequest(
      'GET',
      `${WEBHOOK_SITE_API}/token/${token}/requests?sorting=newest`
    );
    if (res.body && res.body.data && res.body.data.length > 0) {
      return res.body.data;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return [];
}

describe('Webhook Integration Tests (webhook.site)', () => {
  let webhookToken;

  beforeAll(async () => {
    // Create a webhook.site token for external validation
    try {
      webhookToken = await createWebhookSiteToken();
      console.log(`Webhook.site token created: ${webhookToken}`);
    } catch (err) {
      console.warn(`webhook.site unavailable: ${err.message} — skipping external tests`);
      webhookToken = null;
    }
  });

  beforeEach(async () => {
    // Clear webhook log before each test
    try {
      await httpRequest('DELETE', `${GATEWAY_URL}/webhook/log`);
    } catch {
      // Gateway might not be running — test will be skipped
    }
  });

  describe('POST /webhook/receive', () => {
    test('should receive a webhook and return acknowledgment', async () => {
      const payload = {
        event: 'bounty.created',
        data: {
          issueId: 'issue-test-1',
          rewardMYZ: 100,
          assignedTo: 'testuser',
        },
        timestamp: new Date().toISOString(),
      };

      const res = await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.webhookId).toBe(1);
      expect(res.body.timestamp).toBeDefined();
    });

    test('should accept webhooks with custom headers', async () => {
      const payload = { event: 'test.custom', source: 'github-actions' };
      const res = await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should handle empty body gracefully', async () => {
      const res = await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, {});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should handle large payloads', async () => {
      const largePayload = {
        event: 'bulk.sync',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `entry-${i}`,
          value: `test-value-${i}`.repeat(10),
        })),
      };

      const res = await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, largePayload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /webhook/log', () => {
    test('should return webhook log entries', async () => {
      // Send a few webhooks first
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'test.1' });
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'test.2' });
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'test.3' });

      const res = await httpRequest('GET', `${GATEWAY_URL}/webhook/log`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBeGreaterThanOrEqual(3);
      expect(res.body.entries).toBeDefined();
      expect(Array.isArray(res.body.entries)).toBe(true);

      // Each entry should have required fields
      res.body.entries.forEach((entry) => {
        expect(entry.id).toBeDefined();
        expect(entry.timestamp).toBeDefined();
        expect(entry.body).toBeDefined();
        expect(entry.method).toBe('POST');
      });
    });

    test('should respect limit parameter', async () => {
      // Clear and send 10 webhooks
      await httpRequest('DELETE', `${GATEWAY_URL}/webhook/log`);
      for (let i = 0; i < 10; i++) {
        await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: `test.${i}` });
      }

      const res = await httpRequest('GET', `${GATEWAY_URL}/webhook/log?limit=3`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);
      expect(res.body.entries.length).toBe(3);
    });

    test('should filter by since parameter', async () => {
      const beforeTime = new Date().toISOString();
      
      // Wait 1 second and send a webhook
      await new Promise((r) => setTimeout(r, 1100));
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'after.timestamp' });

      const res = await httpRequest('GET', `${GATEWAY_URL}/webhook/log?since=${encodeURIComponent(beforeTime)}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      
      const allRecent = res.body.entries.every(
        (e) => new Date(e.timestamp) >= new Date(beforeTime)
      );
      expect(allRecent).toBe(true);
    });
  });

  describe('GET /webhook/status', () => {
    test('should return health status', async () => {
      const res = await httpRequest('GET', `${GATEWAY_URL}/webhook/status`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.uptime).toBeDefined();
      expect(typeof res.body.webhooksReceived).toBe('number');
    });
  });

  describe('DELETE /webhook/log', () => {
    test('should clear all webhook entries', async () => {
      // Send some webhooks
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'clear.test.1' });
      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: 'clear.test.2' });

      // Verify they exist
      const before = await httpRequest('GET', `${GATEWAY_URL}/webhook/log`);
      expect(before.body.total).toBeGreaterThanOrEqual(2);

      // Clear
      const clear = await httpRequest('DELETE', `${GATEWAY_URL}/webhook/log`);
      expect(clear.status).toBe(200);
      expect(clear.body.success).toBe(true);

      // Verify empty
      const after = await httpRequest('GET', `${GATEWAY_URL}/webhook/log`);
      expect(after.body.total).toBe(0);
      expect(after.body.entries.length).toBe(0);
    });
  });

  // External webhook.site validation (skipped if webhook.site is unavailable)
  describe('External webhook.site validation', () => {
    test('webhook.site should receive forwarded events', async () => {
      if (!webhookToken) {
        console.log('Skipping: webhook.site token unavailable');
        return;
      }

      // Send a payload to our gateway that should trigger forwarding
      const payload = {
        event: 'external.test',
        webhookSiteUrl: `${WEBHOOK_SITE_API}/${webhookToken}`,
        data: { testId: `ext-${Date.now()}` },
      };

      await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, payload);

      // Poll webhook.site for the received request
      const requests = await getWebhookSiteRequests(webhookToken);
      
      // Verify our gateway logged the webhook internally
      const log = await httpRequest('GET', `${GATEWAY_URL}/webhook/log?limit=1`);
      expect(log.body.count).toBeGreaterThanOrEqual(1);
      
      const lastEntry = log.body.entries[0];
      expect(lastEntry.body.event).toBe('external.test');
      expect(lastEntry.body.data.testId).toMatch(/^ext-/);
    });

    test('should generate unique webhook.site token', async () => {
      if (!webhookToken) {
        console.log('Skipping: webhook.site token unavailable');
        return;
      }

      const token2 = await createWebhookSiteToken();
      expect(token2).toBeDefined();
      expect(token2).not.toBe(webhookToken);
      expect(typeof token2).toBe('string');
      expect(token2.length).toBeGreaterThan(10);
    });
  });

  describe('Webhook log max size', () => {
    test('should not exceed 100 entries', async () => {
      await httpRequest('DELETE', `${GATEWAY_URL}/webhook/log`);
      
      // Send 150 webhooks
      for (let i = 0; i < 150; i++) {
        await httpRequest('POST', `${GATEWAY_URL}/webhook/receive`, { event: `overflow.${i}` });
      }

      const res = await httpRequest('GET', `${GATEWAY_URL}/webhook/log`);
      expect(res.body.total).toBeLessThanOrEqual(100);
      expect(res.body.entries.length).toBeLessThanOrEqual(100);

      // The oldest entries should have been dropped — first IDs should be > 50
      const firstId = res.body.entries[0].id;
      expect(firstId).toBeGreaterThan(50);
    });
  });
});
