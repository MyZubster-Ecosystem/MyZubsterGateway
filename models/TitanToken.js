const mongoose = require('mongoose');

const TitanTokenSchema = new mongoose.Schema({
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
    enum: ['Methane Lakes', 'Hydrocarbon Seas', 'Ice Mountains', 'Dune Fields', 'Cryovolcanoes', 'Atmosphere', 'Polar Regions'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['lake', 'sea', 'mountain', 'dune', 'volcano', 'atmosphere', 'polar'],
    default: 'lake'
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  resources: {
    methane: { type: Number, default: 0 },
    ethane: { type: Number, default: 0 },
    nitrogen: { type: Number, default: 0 },
    hydrogen: { type: Number, default: 0 },
    hydrocarbons: { type: Number, default: 0 },
    tholins: { type: Number, default: 0 }
  },
  atmosphericProperties: {
    pressure: { type: Number },
    temperature: { type: Number },
    composition: { type: String }
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 92
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 65
  },
  resourcePotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 88
  },
  annualYield: {
    type: Number,
    default: 12
  },
  status: {
    type: String,
    enum: ['available', 'sold_out', 'reserved', 'exploration'],
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

module.exports = mongoose.model('TitanToken', TitanTokenSchema);
