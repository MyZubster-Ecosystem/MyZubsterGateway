'use strict';

const express = require('express');
const {
  buildFilters,
  toCsv,
  toGeoJSON,
} = require('../utils/seedExchangeExport');

// The Seed Exchange model ships with the listing API (PR #104 / #107). Load it
// lazily so this router still registers cleanly when the model is not present
// yet, and answer with a clear 503 in that case.
let SeedExchange = null;
try {
  SeedExchange = require('../models/SeedExchange');
} catch (err) {
  SeedExchange = null;
}

const router = express.Router();

function modelUnavailable(res) {
  return res.status(503).json({
    success: false,
    error: 'Seed Exchange data model is not available yet (requires the Seed Exchange listing API).',
  });
}

async function fetchListings(query) {
  const { filter, error } = buildFilters(query || {});
  if (error) return { error };
  if (!SeedExchange) return { unavailable: true };
  const listings = await SeedExchange.find(filter).sort({ createdAt: -1 }).lean();
  return { listings };
}

// GET /api/seed-exchange/export/csv
router.get('/csv', async (req, res) => {
  try {
    const result = await fetchListings(req.query);
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }
    if (result.unavailable) return modelUnavailable(res);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="seed-exchange-listings.csv"');
    return res.send(toCsv(result.listings));
  } catch (error) {
    console.error('Seed exchange CSV export error:', error);
    return res.status(500).json({ success: false, error: 'unable to export seed exchange listings' });
  }
});

// GET /api/seed-exchange/export/geojson
router.get('/geojson', async (req, res) => {
  try {
    const result = await fetchListings(req.query);
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }
    if (result.unavailable) return modelUnavailable(res);

    res.setHeader('Content-Type', 'application/geo+json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="seed-exchange-listings.geojson"');
    return res.json(toGeoJSON(result.listings));
  } catch (error) {
    console.error('Seed exchange GeoJSON export error:', error);
    return res.status(500).json({ success: false, error: 'unable to export seed exchange listings' });
  }
});

module.exports = router;
