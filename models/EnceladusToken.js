const mongoose = require('mongoose');

const EnceladusTokenSchema = new mongoose.Schema({
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
    enum: ['South Polar Geysers', 'Subsurface Ocean', 'Ice Crust', 'Tiger Stripes', 'Surface Craters', 'Plume Regions'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['geyser', 'ocean', 'ice', 'stripes', 'crater', 'plume'],
    default: 'ice'
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
    hydrothermalVents: { type: Number, default: 0 }
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
  geyserProperties: {
    height: { type: Number },
    frequency: { type: Number },
    composition: { type: String }
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 97
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 68
  },
  lifeProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 88
  },
  annualYield: {
    type: Number,
    default: 13
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

module.exports = mongoose.model('EnceladusToken', EnceladusTokenSchema);
