const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');

const EnvironmentalDataRecord = require('../models/EnvironmentalDataRecord');
const DataImportAudit = require('../models/DataImportAudit');

const router = express.Router();
const MAX_ROWS = Number(process.env.DATA_IMPORT_MAX_ROWS || 2000);
const MAX_SOURCE_LENGTH = 240;

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function requireImportKey(req, res, next) {
  const expected = process.env.DATA_IMPORT_KEY;
  if (!expected) {
    return res.status(503).json({
      error: 'Data import is not configured',
      code: 'DATA_IMPORT_KEY_MISSING',
    });
  }

  const supplied = req.get('x-import-key');
  if (!timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ error: 'Invalid import key' });
  }
  return next();
}

function parseCsv(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('CSV data must be a non-empty string');
  }

  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === '"') {
      if (quoted && next === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (ch === ',' && !quoted) {
      row.push(field);
      field = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((value) => String(value).trim() !== '')) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (quoted) throw new Error('CSV contains an unterminated quoted field');
  row.push(field);
  if (row.some((value) => String(value).trim() !== '')) rows.push(row);

  if (rows.length < 2) throw new Error('CSV must include a header and at least one data row');

  const headers = rows[0].map((value) => String(value).trim());
  if (headers.some((header) => !header)) throw new Error('CSV contains an empty header');
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate headers');

  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] === undefined ? '' : values[index];
    });
    return record;
  });
}

function parseJson(input) {
  let value = input;
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (_error) {
      throw new Error('JSON data is invalid');
    }
  }

  const records = Array.isArray(value) ? value : value?.records;
  if (!Array.isArray(records)) {
    throw new Error('JSON must be an array or an object containing a records array');
  }
  return records;
}

function validateRecord(record, index) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(`Row ${index + 1} is not an object`);
  }
  if (Object.keys(record).length === 0) {
    throw new Error(`Row ${index + 1} is empty`);
  }
  return record;
}

function normalizePayload(body = {}) {
  const format = String(body.format || '').toLowerCase();
  if (!['csv', 'json'].includes(format)) {
    throw new Error('format must be csv or json');
  }

  const datasetType = String(body.datasetType || '').trim();
  const source = String(body.source || '').trim();
  if (!datasetType) throw new Error('datasetType is required');
  if (!source) throw new Error('source is required');
  if (datasetType.length > 120) throw new Error('datasetType is too long');
  if (source.length > MAX_SOURCE_LENGTH) throw new Error('source is too long');

  const parsed = format === 'csv' ? parseCsv(body.data) : parseJson(body.data);
  if (parsed.length === 0) throw new Error('No records found');
  if (parsed.length > MAX_ROWS) throw new Error(`Import exceeds maximum row count (${MAX_ROWS})`);

  const records = parsed.map(validateRecord);
  const fieldSet = new Set();
  const warnings = [];

  records.forEach((record) => {
    Object.keys(record).forEach((key) => fieldSet.add(key));
  });

  const schemaFields = Array.from(fieldSet).sort();
  records.forEach((record, index) => {
    const missing = schemaFields.filter((field) => !(field in record));
    if (missing.length) warnings.push(`Row ${index + 1} is missing fields: ${missing.join(', ')}`);
  });

  const canonical = JSON.stringify({ datasetType, source, format, records });
  const digest = crypto.createHash('sha256').update(canonical).digest('hex');

  return {
    datasetType,
    source,
    format,
    records,
    schemaFields,
    warnings: warnings.slice(0, 100),
    digest,
  };
}

async function ensureDatabase() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    const error = new Error('MongoDB is not configured');
    error.status = 503;
    error.code = 'MONGODB_URI_MISSING';
    throw error;
  }
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

router.post('/preview', requireImportKey, (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    return res.json({
      ok: true,
      requiresConfirmation: true,
      digest: normalized.digest,
      datasetType: normalized.datasetType,
      source: normalized.source,
      format: normalized.format,
      rowCount: normalized.records.length,
      schemaFields: normalized.schemaFields,
      warnings: normalized.warnings,
      preview: normalized.records.slice(0, 10),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/commit', requireImportKey, async (req, res, next) => {
  try {
    if (req.body?.confirmation !== true) {
      return res.status(400).json({ error: 'confirmation=true is required before database write' });
    }

    const normalized = normalizePayload(req.body);
    if (!req.body.expectedDigest || req.body.expectedDigest !== normalized.digest) {
      return res.status(409).json({
        error: 'Payload changed after preview or expectedDigest is missing',
        digest: normalized.digest,
      });
    }

    await ensureDatabase();

    const importBatchId = crypto.randomUUID();
    const importedBy = String(req.body.importedBy || 'zorgax').trim().slice(0, 120) || 'zorgax';
    const documents = normalized.records.map((data, index) => ({
      importBatchId,
      datasetType: normalized.datasetType,
      source: normalized.source,
      rowNumber: index + 1,
      data,
      importedBy,
    }));

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await EnvironmentalDataRecord.insertMany(documents, { session });
        await DataImportAudit.create(
          [
            {
              importBatchId,
              digest: normalized.digest,
              datasetType: normalized.datasetType,
              source: normalized.source,
              format: normalized.format,
              rowCount: normalized.records.length,
              schemaFields: normalized.schemaFields,
              warnings: normalized.warnings,
              importedBy,
              status: 'committed',
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      ok: true,
      importBatchId,
      digest: normalized.digest,
      rowCount: normalized.records.length,
      datasetType: normalized.datasetType,
      source: normalized.source,
      status: 'committed',
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/status', requireImportKey, (_req, res) => {
  res.json({
    ok: true,
    service: 'zorgax-data-import',
    formats: ['csv', 'json'],
    maxRows: MAX_ROWS,
    confirmationRequired: true,
    databaseConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI),
  });
});

module.exports = router;
module.exports._test = { parseCsv, parseJson, normalizePayload };
