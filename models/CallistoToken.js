const mongoose = require('mongoose');

const CallistoTokenSchema = new mongoose.Schema({
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
    enum: ['Subsurface Ocean', 'Ice Crust', 'Craters', 'Valhalla Basin', 'Asgard Basin', 'Dark Terrain', 'Bright Terrain'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['ocean', 'ice', 'crater', 'basin', 'dark', 'bright'],
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
    impactHistory: { type: Number, default: 0 }
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
  impactProperties: {
    diameter: { type: Number },
    age: { type: Number },
    depth: { type: Number }
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 88
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  radiationShielding: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  annualYield: {
    type: Number,
    default: 10
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

module.exports = mongoose.model('CallistoToken', CallistoTokenSchema);
