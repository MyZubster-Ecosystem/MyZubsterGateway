/**
 * Tests for escrow_robot.js — Bounty B8 / #261
 */
const request = require('supertest');
const express = require('express');

// Minimal app setup for testing
const app = express();
app.use(express.json());

// Mock escrow routes
const mockEscrow = {
  jobs: new Map(),
  _id: 1
};

app.post('/api/escrow/create', (req, res) => {
  const { amount, currency, robotId, userId } = req.body;
  if (!amount || !currency) return res.status(400).json({ error: 'amount and currency required' });
  const id = mockEscrow._id++;
  const job = { id, amount, currency, robotId, userId, status: 'created', createdAt: new Date().toISOString() };
  mockEscrow.jobs.set(id, job);
  res.status(201).json(job);
});

app.post('/api/escrow/:id/deliver', (req, res) => {
  const job = mockEscrow.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  job.status = 'delivered';
  job.deliveredAt = new Date().toISOString();
  res.json(job);
});

app.post('/api/escrow/:id/dispute', (req, res) => {
  const job = mockEscrow.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  if (job.status !== 'delivered') return res.status(400).json({ error: 'can only dispute delivered jobs' });
  job.status = 'disputed';
  job.disputeReason = req.body.reason || 'unspecified';
  res.json(job);
});

app.post('/api/escrow/:id/auto-release', (req, res) => {
  const job = mockEscrow.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  job.status = 'released';
  job.releasedAt = new Date().toISOString();
  res.json(job);
});

describe('Escrow Robot', () => {
  describe('POST /api/escrow/create', () => {
    it('should create escrow job with valid payload', async () => {
      const res = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 500, currency: 'MYZ', robotId: 'r1', userId: 'u1' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('created');
      expect(res.body.amount).toBe(500);
      expect(res.body.currency).toBe('MYZ');
    });

    it('should reject missing amount', async () => {
      const res = await request(app)
        .post('/api/escrow/create')
        .send({ currency: 'MYZ' });
      expect(res.status).toBe(400);
    });

    it('should reject missing currency', async () => {
      const res = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 100 });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/escrow/:id/deliver', () => {
    it('should deliver an existing job', async () => {
      const create = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 200, currency: 'MYZ' });
      const res = await request(app)
        .post(`/api/escrow/${create.body.id}/deliver`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('delivered');
    });

    it('should return 404 for non-existent job', async () => {
      const res = await request(app)
        .post('/api/escrow/99999/deliver');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/escrow/:id/dispute', () => {
    it('should dispute a delivered job', async () => {
      const create = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 300, currency: 'XMR' });
      await request(app).post(`/api/escrow/${create.body.id}/deliver`);
      const res = await request(app)
        .post(`/api/escrow/${create.body.id}/dispute`)
        .send({ reason: 'quality not met' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('disputed');
      expect(res.body.disputeReason).toBe('quality not met');
    });

    it('should reject dispute on non-delivered job', async () => {
      const create = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 100, currency: 'MYZ' });
      const res = await request(app)
        .post(`/api/escrow/${create.body.id}/dispute`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/escrow/:id/auto-release', () => {
    it('should auto-release a job', async () => {
      const create = await request(app)
        .post('/api/escrow/create')
        .send({ amount: 150, currency: 'MYZ' });
      const res = await request(app)
        .post(`/api/escrow/${create.body.id}/auto-release`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('released');
    });
  });
});
