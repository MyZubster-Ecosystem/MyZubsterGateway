const mongoose = require('mongoose');

const CeresTokenSchema = new mongoose.Schema({
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
  zone: {
    type: String,
    enum: ['Occator Crater', 'Ahuna Mons', 'Urvara Crater', 'Dantu Crater', 'Northern Plains', 'Southern Highlands'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['crater', 'mountain', 'plain', 'highland'],
    default: 'plain'
  },
  size: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['km2', 'hectares'], default: 'km2' }
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  resources: {
    waterIce: { type: Number, default: 0 },
    carbon: { type: Number, default: 0 },
    silicates: { type: Number, default: 0 },
    ammonia: { type: Number, default: 0 },
    organicCompounds: { type: Number, default: 0 }
  },
  cryovolcanism: {
    type: Boolean,
    default: false
  },
  miningPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  solarPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 90
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  annualYield: {
    type: Number,
    default: 13
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

module.exports = mongoose.model('CeresToken', CeresTokenSchema);
