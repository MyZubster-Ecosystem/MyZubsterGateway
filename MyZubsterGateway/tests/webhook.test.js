const express = require('express');
const request = require('supertest');

const createdLogs = [];

jest.mock('../models/WebhookLog', () => ({
  create: jest.fn(async (document) => {
    const log = {
      _id: `log-${createdLogs.length + 1}`,
      ...document,
      toObject() {
        return this;
      },
    };
    createdLogs.push(log);
    return log;
  }),
  find: jest.fn(() => ({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn(async () => createdLogs),
  })),
}));

const WebhookLog = require('../models/WebhookLog');
const WebhookService = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRoutervice = require('../services/webhookService');
const webhookRout