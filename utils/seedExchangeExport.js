'use strict';

// Pure serialization + filtering helpers for the Seed Exchange export endpoints.
//
// These helpers intentionally mirror the field contract and filter semantics of
// the Seed Exchange listing API (see PR #104 / #107):
//   * plant   -> case-insensitive regex on plantName
//   * type    -> canonical enum (seeds / cuttings / seedlings / bulbs)
//   * location-> case-insensitive regex on location
//
// They are kept free of any runtime dependency (no express, no mongoose) so they
// can be unit-tested and reused without a database connection.

const TYPE_ALIASES = new Map([
  ['seed', 'seeds'],
  ['seeds', 'seeds'],
  ['seme', 'seeds'],
  ['semi', 'seeds'],
  ['cutting', 'cuttings'],
  ['cuttings', 'cuttings'],
  ['talea', 'cuttings'],
  ['talee', 'cuttings'],
  ['seedling', 'seedlings'],
  ['seedlings', 'seedlings'],
  ['piantina', 'seedlings'],
  ['piantine', 'seedlings'],
  ['bulb', 'bulbs'],
  ['bulbs', 'bulbs'],
  ['bulbo', 'bulbs'],
  ['bulbi', 'bulbs'],
]);

const CSV_COLUMNS = [
  'id',
  'userId',
  'plantName',
  'variety',
  'type',
  'quantity',
  'availability',
  'exchangeType',
  'location',
  'latitude',
  'longitude',
  'description',
  'createdAt',
  'updatedAt',
];

function firstDefined(source, keys) {
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }
  return undefined;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEnum(value, aliases) {
  const key = normalizeText(value).toLowerCase();
  return aliases.get(key) || null;
}

function queryText(query, keys) {
  return normalizeText(firstDefined(query, keys));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the Mongo filter for the export endpoints. This is the exact same
 * filter contract used by the listing API so the exports honour the same
 * `plant`, `type` and `location` query parameters.
 */
function buildFilters(query) {
  const filter = {};
  const plant = queryText(query, ['plantName', 'plant', 'pianta']);
  const location = queryText(query, ['location', 'posizione']);
  const rawType = queryText(query, ['type', 'tipo']);

  if (plant) filter.plantName = { $regex: escapeRegex(plant), $options: 'i' };
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };

  if (rawType) {
    const type = normalizeEnum(rawType, TYPE_ALIASES);
    if (!type) {
      return { error: 'type must be seeds, cuttings, seedlings, or bulbs' };
    }
    filter.type = type;
  }

  return { filter };
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Returns GeoJSON coordinates `[longitude, latitude]` when the listing exposes
 * a location, otherwise `null`. Coordinates may come from `latitude`/`longitude`
 * fields or from a `coordinates` value ([lng, lat] or {lat, lng}).
 */
function extractCoordinates(listing) {
  if (!listing) return null;

  const lat = toNumber(listing.latitude);
  const lng = toNumber(listing.longitude);
  if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return [lng, lat];
  }

  const coords = listing.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const c0 = toNumber(coords[0]);
    const c1 = toNumber(coords[1]);
    if (c0 !== null && c1 !== null && Math.abs(c1) <= 90 && Math.abs(c0) <= 180) {
      return [c0, c1];
    }
  } else if (coords && typeof coords === 'object') {
    const clat = toNumber(coords.latitude != null ? coords.latitude : coords.lat);
    const clng = toNumber(coords.longitude != null ? coords.longitude : coords.lng);
    if (clat !== null && clng !== null && Math.abs(clat) <= 90 && Math.abs(clng) <= 180) {
      return [clng, clat];
    }
  }

  return null;
}

/**
 * Normalizes a listing document (mongoose doc or plain/lean object) into the
 * public flat shape used by both CSV and GeoJSON exports.
 */
function toPublicListing(listing) {
  const value =
    listing && typeof listing.toObject === 'function' ? listing.toObject() : listing || {};
  const coords = extractCoordinates(value);

  return {
    id: value._id != null ? String(value._id) : '',
    userId: value.userId != null ? String(value.userId) : '',
    plantName: value.plantName || '',
    variety: value.variety || '',
    type: value.type || '',
    quantity: value.quantity != null ? value.quantity : '',
    availability: value.availability || '',
    exchangeType: value.exchangeType || '',
    location: value.location || '',
    latitude: coords ? coords[1] : '',
    longitude: coords ? coords[0] : '',
    description: value.description || '',
    createdAt: value.createdAt ? new Date(value.createdAt).toISOString() : '',
    updatedAt: value.updatedAt ? new Date(value.updatedAt).toISOString() : '',
  };
}

/**
 * RFC 4180 CSV field escaping: every field is quoted and embedded quotes are
 * doubled.
 */
function csvEscape(value) {
  if (value === null || value === undefined) value = '';
  return '"' + String(value).replace(/"/g, '""') + '"';
}

/**
 * Serializes listings into a CSV document (header + one row per listing).
 */
function toCsv(listings) {
  const rows = [CSV_COLUMNS.join(',')];
  for (const listing of listings || []) {
    const pub = toPublicListing(listing);
    rows.push(CSV_COLUMNS.map((column) => csvEscape(pub[column])).join(','));
  }
  return rows.join('\r\n') + '\r\n';
}

/**
 * Serializes listings into a GeoJSON FeatureCollection. Listings with usable
 * coordinates become Point features; listings without coordinates are emitted
 * with a `null` geometry (valid GeoJSON) so their properties remain exportable.
 */
function toGeoJSON(listings) {
  const features = (listings || []).map((listing) => {
    const coords = extractCoordinates(listing);
    return {
      type: 'Feature',
      geometry: coords ? { type: 'Point', coordinates: coords } : null,
      properties: toPublicListing(listing),
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

module.exports = {
  TYPE_ALIASES,
  CSV_COLUMNS,
  buildFilters,
  toPublicListing,
  toCsv,
  toGeoJSON,
  csvEscape,
  extractCoordinates,
};
