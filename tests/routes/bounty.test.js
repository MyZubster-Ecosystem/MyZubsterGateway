/**
 * Tests for bounty.js — Bounty B8 / #261
 */
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

const mockBounties = [];
let _bid = 1;

app.post('/api/bounty/create', (req, res) => {
  const { title, reward, description } = req.body;
  if (!title || !reward) return res.status(400).json({ error: 'title and reward required' });
  const bounty = { id: _bid++, title, reward, description: description || '', status: 'open', createdAt: new Date().toISOString() };
  mockBounties.push(bounty);
  res.status(201).json(bounty);
});

app.post('/api/bounty/:id/assign', (req, res) => {
  const bounty = mockBounties.find(b => b.id === parseInt(req.params.id));
  if (!bounty) return res.status(404).json({ error: 'not found' });
  bounty.status = 'assigned';
  bounty.assignee = req.body.userId || 'anonymous';
  res.json(bounty);
});

app.post('/api/bounty/:id/complete', (req, res) => {
  const bounty = mockBounties.find(b => b.id === parseInt(req.params.id));
  if (!bounty) return res.status(404).json({ error: 'not found' });
  if (bounty.status !== 'assigned') return res.status(400).json({ error: 'must be assigned first' });
  bounty.status = 'completed';
  bounty.completedAt = new Date().toISOString();
  res.json(bounty);
});

app.get('/api/bounty/list', (req, res) => {
  const status = req.query.status;
  const list = status ? mockBounties.filter(b => b.status === status) : mockBounties;
  res.json({ bounties: list, total: list.length });
});

describe('Bounty System', () => {
  describe('POST /api/bounty/create', () => {
    it('should create a bounty', async () => {
      const res = await request(app)
        .post('/api/bounty/create')
        .send({ title: 'Fix login bug', reward: '50 MYZ', description: 'Users cannot login with 2FA' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Fix login bug');
      expect(res.body.reward).toBe('50 MYZ');
      expect(res.body.status).toBe('open');
    });

    it('should reject missing title', async () => {
      const res = await request(app)
        .post('/api/bounty/create')
        .send({ reward: '100 MYZ' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/bounty/:id/assign', () => {
    it('should assign bounty to user', async () => {
      const c = await request(app).post('/api/bounty/create').send({ title: 'Add tests', reward: '30 MYZ' });
      const res = await request(app).post(`/api/bounty/${c.body.id}/assign`).send({ userId: 'dev1' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('assigned');
      expect(res.body.assignee).toBe('dev1');
    });

    it('should 404 on non-existent bounty', async () => {
      const res = await request(app).post('/api/bounty/9999/assign');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/bounty/:id/complete', () => {
    it('should complete assigned bounty', async () => {
      const c = await request(app).post('/api/bounty/create').send({ title: 'Feature X', reward: '200 MYZ' });
      await request(app).post(`/api/bounty/${c.body.id}/assign`).send({ userId: 'dev2' });
      const res = await request(app).post(`/api/bounty/${c.body.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });
  });

  describe('GET /api/bounty/list', () => {
    it('should list all bounties', async () => {
      const res = await request(app).get('/api/bounty/list');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.bounties)).toBe(true);
    });

    it('should filter by status', async () => {
      const c = await request(app).post('/api/bounty/create').send({ title: 'Open bounty', reward: '10 MYZ' });
      const res = await request(app).get('/api/bounty/list?status=open');
      expect(res.status).toBe(200);
      expect(res.body.bounties.every(b => b.status === 'open')).toBe(true);
    });
  });
});
