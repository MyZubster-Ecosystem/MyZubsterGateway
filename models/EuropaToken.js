const mongoose = require('mongoose');

const EuropaTokenSchema = new mongoose.Schema({
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
    enum: ['Subglacial Ocean', 'Ice Crust', 'Surface Ridges', 'Chaos Terrain', 'Lineae', 'Crater', 'Tidal Zone'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['ocean', 'ice', 'ridge', 'chaos', 'linea', 'crater', 'tidal'],
    default: 'ice'
  },
  depth: {
    value: { type: Number },
    unit: { type: String, enum: ['km', 'm'], default: 'km' }
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  resources: {
    water: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 },
    salt: { type: Number, default: 0 },
    organicCompounds: { type: Number, default: 0 },
    minerals: { type: Number, default: 0 },
    lifePotential: { type: Number, default: 0 }
  },
  oceanProperties: {
    salinity: { type: Number },
    temperature: { type: Number },
    pressure: { type: Number },
    pH: { type: Number }
  },
  iceProperties: {
    thickness: { type: Number },
    age: { type: Number },
    composition: { type: String }
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 95
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  lifeProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 65
  },
  annualYield: {
    type: Number,
    default: 11
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

module.exports = mongoose.model('EuropaToken', EuropaTokenSchema);
