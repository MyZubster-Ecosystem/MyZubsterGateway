const mongoose = require('mongoose');

const MarsTokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  totalSupply: {
    type: Number,
    required: true
  },
  tokenPrice: {
    type: Number,
    required: true,
    default: 100
  },
  decimals: {
    type: Number,
    default: 18
  },
  zone: {
    type: String,
    enum: ['Valles Marineris', 'Olympus Mons', 'Tharsis', 'Elysium', 'Hellas', 'Argyre', 'Gale Crater', 'Jezero', 'Polar Caps', 'Terra Cimmeria'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['valley', 'mountain', 'volcano', 'crater', 'plain', 'polar', 'highland'],
    default: 'plain'
  },
  size: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['km2', 'hectares', 'acres'], default: 'km2' }
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  resources: {
    waterIce: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    aluminum: { type: Number, default: 0 },
    titanium: { type: Number, default: 0 },
    rareEarth: { type: Number, default: 0 },
    methane: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 }
  },
  miningPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  solarPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  lifePotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 40
  },
  annualYield: {
    type: Number,
    default: 12
  },
  status: {
    type: String,
    enum: ['available', 'sold_out', 'reserved', 'upcoming'],
    default: 'available'
  },
  mission: {
    name: String,
    date: Date,
    agency: String,
    description: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarsToken', MarsTokenSchema);
