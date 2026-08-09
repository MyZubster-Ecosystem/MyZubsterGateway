const mongoose = require('mongoose');

const GanymedeTokenSchema = new mongoose.Schema({
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
    enum: ['Subsurface Ocean', 'Ice Crust', 'Dark Terrain', 'Bright Terrain', 'Grooved Terrain', 'Craters', 'Polar Caps'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['ocean', 'ice', 'dark', 'bright', 'grooved', 'crater', 'polar'],
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
    magneticField: { type: Number, default: 0 }
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
  magneticProperties: {
    fieldStrength: { type: Number },
    fieldType: { type: String }
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 93
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 72
  },
  lifeProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
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

module.exports = mongoose.model('GanymedeToken', GanymedeTokenSchema);
