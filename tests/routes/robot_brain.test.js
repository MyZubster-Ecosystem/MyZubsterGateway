/**
 * Tests for robot_brain.js — Bounty B8 / #261
 */
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

const mockBrain = {
  jobs: new Map(),
  _id: 100
};

app.post('/api/brain/create', (req, res) => {
  const { task, robotType, priority } = req.body;
  if (!task) return res.status(400).json({ error: 'task required' });
  const id = mockBrain._id++;
  const job = { id, task, robotType: robotType || 'default', priority: priority || 1, status: 'pending', createdAt: new Date().toISOString() };
  mockBrain.jobs.set(id, job);
  res.status(201).json(job);
});

app.post('/api/brain/:id/assign', (req, res) => {
  const job = mockBrain.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'not found' });
  job.status = 'assigned';
  job.robotId = req.body.robotId || 'auto';
  res.json(job);
});

app.post('/api/brain/:id/execute', (req, res) => {
  const job = mockBrain.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'not found' });
  if (job.status !== 'assigned') return res.status(400).json({ error: 'must be assigned first' });
  job.status = 'executing';
  res.json(job);
});

app.post('/api/brain/:id/deliver', (req, res) => {
  const job = mockBrain.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'not found' });
  job.status = 'completed';
  job.result = req.body.result || {};
  res.json(job);
});

app.post('/api/brain/:id/dispute', (req, res) => {
  const job = mockBrain.jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'not found' });
  job.status = 'disputed';
  res.json(job);
});

describe('Robot Brain', () => {
  describe('POST /api/brain/create', () => {
    it('should create a brain task', async () => {
      const res = await request(app)
        .post('/api/brain/create')
        .send({ task: 'sort packages', robotType: 'arm', priority: 2 });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
      expect(res.body.priority).toBe(2);
    });

    it('should reject missing task', async () => {
      const res = await request(app)
        .post('/api/brain/create')
        .send({ robotType: 'drone' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/brain/:id/assign', () => {
    it('should assign job to robot', async () => {
      const c = await request(app).post('/api/brain/create').send({ task: 'deliver' });
      const res = await request(app).post(`/api/brain/${c.body.id}/assign`).send({ robotId: 'r2' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('assigned');
      expect(res.body.robotId).toBe('r2');
    });
  });

  describe('POST /api/brain/:id/execute', () => {
    it('should execute assigned job', async () => {
      const c = await request(app).post('/api/brain/create').send({ task: 'scan' });
      await request(app).post(`/api/brain/${c.body.id}/assign`).send({ robotId: 'r1' });
      const res = await request(app).post(`/api/brain/${c.body.id}/execute`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('executing');
    });

    it('should reject execute on non-assigned job', async () => {
      const c = await request(app).post('/api/brain/create').send({ task: 'scan' });
      const res = await request(app).post(`/api/brain/${c.body.id}/execute`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/brain/:id/deliver', () => {
    it('should deliver completed work', async () => {
      const c = await request(app).post('/api/brain/create').send({ task: 'assemble' });
      await request(app).post(`/api/brain/${c.body.id}/assign`);
      await request(app).post(`/api/brain/${c.body.id}/execute`);
      const res = await request(app).post(`/api/brain/${c.body.id}/deliver`).send({ result: { ok: true } });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });
  });
});
