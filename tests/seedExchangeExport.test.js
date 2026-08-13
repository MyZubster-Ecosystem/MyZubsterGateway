'use strict';

const {
  buildFilters,
  toCsv,
  toGeoJSON,
  toPublicListing,
  csvEscape,
  extractCoordinates,
} = require('../utils/seedExchangeExport');

describe('seed exchange export utilities', () => {
  const listing = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    plantName: 'Tomato',
    variety: 'San Marzano',
    type: 'seeds',
    quantity: 25,
    availability: 'immediate',
    exchangeType: 'barter',
    location: 'Rome, IT',
    latitude: 41.9028,
    longitude: 12.4964,
    description: 'Heirloom, organic',
    createdAt: new Date('2026-08-01T10:00:00Z'),
    updatedAt: new Date('2026-08-01T10:00:00Z'),
  };

  describe('buildFilters', () => {
    test('builds plant, location and type filters like the listing API', () => {
      const { filter, error } = buildFilters({ plant: 'tomato', location: 'rome', type: 'seed' });
      expect(error).toBeUndefined();
      expect(filter.plantName).toEqual({ $regex: 'tomato', $options: 'i' });
      expect(filter.location).toEqual({ $regex: 'rome', $options: 'i' });
      expect(filter.type).toBe('seeds');
    });

    test('normalizes type aliases', () => {
      expect(buildFilters({ type: 'TALEA' }).filter.type).toBe('cuttings');
      expect(buildFilters({ type: 'piantine' }).filter.type).toBe('seedlings');
      expect(buildFilters({ type: 'bulbo' }).filter.type).toBe('bulbs');
    });

    test('escapes regex special characters', () => {
      const { filter } = buildFilters({ plant: 'a+b' });
      expect(filter.plantName.$regex).toBe('a\\+b');
    });

    test('rejects unknown type values', () => {
      const { error } = buildFilters({ type: 'nope' });
      expect(error).toMatch(/seeds, cuttings, seedlings, or bulbs/);
    });
  });

  describe('csvEscape', () => {
    test('quotes fields and doubles embedded quotes', () => {
      expect(csvEscape('a,b')).toBe('"a,b"');
      expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
      expect(csvEscape(42)).toBe('"42"');
      expect(csvEscape(null)).toBe('""');
      expect(csvEscape(undefined)).toBe('""');
    });
  });

  describe('toCsv', () => {
    test('emits a header row and one row per listing', () => {
      const csv = toCsv([listing]);
      const lines = csv.split('\r\n');
      expect(lines[0]).toContain('plantName');
      expect(lines[0]).toContain('exchangeType');
      expect(lines[0]).toContain('latitude');
      expect(lines[1]).toContain('San Marzano');
      expect(lines[1]).toContain('"41.9028"');
      expect(lines[1]).toContain('"12.4964"');
    });
  });

  describe('extractCoordinates', () => {
    test('reads latitude/longitude as [lng, lat]', () => {
      expect(extractCoordinates(listing)).toEqual([12.4964, 41.9028]);
    });

    test('returns null without coordinates', () => {
      const { latitude, longitude, ...rest } = listing;
      expect(extractCoordinates(rest)).toBeNull();
    });
  });

  describe('toGeoJSON', () => {
    test('builds a FeatureCollection with Point geometry', () => {
      const gj = toGeoJSON([listing]);
      expect(gj.type).toBe('FeatureCollection');
      expect(gj.features).toHaveLength(1);
      expect(gj.features[0].geometry).toEqual({ type: 'Point', coordinates: [12.4964, 41.9028] });
      expect(gj.features[0].properties.plantName).toBe('Tomato');
      expect(gj.features[0].properties.exchangeType).toBe('barter');
      expect(gj.features[0].properties.id).toBe('507f1f77bcf86cd799439011');
    });

    test('uses a null geometry when coordinates are missing', () => {
      const { latitude, longitude, ...rest } = listing;
      const gj = toGeoJSON([rest]);
      expect(gj.features[0].geometry).toBeNull();
      expect(gj.features[0].properties.location).toBe('Rome, IT');
    });
  });

  describe('toPublicListing', () => {
    test('stringifies ids and dates', () => {
      const pub = toPublicListing(listing);
      expect(pub.id).toBe('507f1f77bcf86cd799439011');
      expect(pub.userId).toBe('507f1f77bcf86cd799439012');
      expect(pub.createdAt).toBe('2026-08-01T10:00:00.000Z');
    });
  });
});
