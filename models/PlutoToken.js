const mongoose = require('mongoose');

const PlutoTokenSchema = new mongoose.Schema({
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
    enum: ['Sputnik Planitia', 'Tombaugh Regio', 'Cthulhu Macula', 'Polar Regions', 'Charon Basin', 'Mountains'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['plain', 'region', 'macula', 'polar', 'basin', 'mountain'],
    default: 'plain'
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  resources: {
    nitrogen: { type: Number, default: 0 },
    methane: { type: Number, default: 0 },
    carbonMonoxide: { type: Number, default: 0 },
    waterIce: { type: Number, default: 0 },
    organicCompounds: { type: Number, default: 0 }
  },
  surfaceProperties: {
    temperature: { type: Number },
    pressure: { type: Number },
    composition: { type: String }
  },
  atmosphereProperties: {
    pressure: { type: Number },
    composition: { type: String },
    seasonal: { type: String }
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
    default: 45
  },
  resourcePotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
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

module.exports = mongoose.model('PlutoToken', PlutoTokenSchema);
