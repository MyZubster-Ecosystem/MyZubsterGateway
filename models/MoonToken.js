const mongoose = require('mongoose');

const MoonTokenSchema = new mongoose.Schema({
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
    enum: ['Mare Tranquillitatis', 'Mare Imbrium', 'Mare Serenitatis', 'Mare Fecunditatis', 'Mare Nubium', 'Mare Frigoris', 'Mare Crisium', 'Oceanus Procellarum', 'South Pole', 'North Pole'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['sea', 'crater', 'highland', 'valley', 'pole', 'mountain'],
    default: 'sea'
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
    helium3: { type: Number, default: 0 },
    waterIce: { type: Number, default: 0 },
    titanium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    rareEarth: { type: Number, default: 0 }
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
    default: 80
  },
  scientificValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  colonizationPotential: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  annualYield: {
    type: Number,
    default: 15 // Alto rendimento per il potenziale futuristico
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

module.exports = mongoose.model('MoonToken', MoonTokenSchema);
