const mongoose = require('mongoose');

const IoTokensSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  totalSupply: { type: Number, required: true },
  tokenPrice: { type: Number, default: 100 },
  zone: {
    type: String,
    enum: ['Volcanic Plains', 'Lava Lakes', 'Mountains', 'Paterae', 'Craters'],
    required: true
  },
  zoneType: {
    type: String,
    enum: ['volcanic', 'lava', 'mountain', 'patera', 'crater'],
    default: 'volcanic'
  },
  resources: {
    sulfur: { type: Number, default: 0 },
    sulfurDioxide: { type: Number, default: 0 },
    silicates: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 }
  },
  volcanicActivity: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  scientificValue: { type: Number, default: 90 },
  colonizationPotential: { type: Number, default: 30 },
  annualYield: { type: Number, default: 9 },
  status: {
    type: String,
    enum: ['available', 'sold_out', 'reserved'],
    default: 'available'
  },
  mission: {
    name: String,
    date: Date,
    agency: String,
    description: String
  }
});

module.exports = mongoose.model('IoToken', IoTokensSchema);
