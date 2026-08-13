'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { adminDashboardAuth } = require('../middleware/adminDashboardAuth');
const { AdminDashboardService } = require('../services/adminDashboardService');

function createDatabaseAdapter() {
  return {
    collection(name) {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        throw new Error('Database is not connected');
      }
      return mongoose.connection.db.collection(name);
    },
    objectId(value) {
      if (!mongoose.isValidObjectId(value)) throw new Error('Invalid user id');
      return new mongoose.Types.ObjectId(value);
    },
  };
}

function createAdminDashboardRouter(options = {}) {
  const router = express.Router();
  const service = options.service || new AdminDashboardService(createDatabaseAdapter());
  const authenticate = options.authenticate || adminDashboardAuth;
  router.use(authenticate);

  const respond = (handler) => async (req, res) => {
    try {
      res.json({ success: true, data: await handler(req) });
    } catch (error) {
      const clientError = /Invalid|Unsupported|No supported|not found/i.test(error.message);
      res.status(clientError ? 400 : 503).json({ success: false, error: error.message });
    }
  };

  router.get('/overview', respond(() => service.overview()));
  router.get('/users', respond((req) => service.users(req.query)));
  router.patch('/users/:id', respond((req) => service.updateUser(req.params.id, req.body)));
  router.get('/payments', respond((req) => service.payments(req.query)));
  router.get('/reports', respond((req) => service.report(req.query.days)));

  return router;
}

module.exports = { createAdminDashboardRouter, createDatabaseAdapter };
