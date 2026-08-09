const mongoose = require('mongoose');

const LandTokenSchema = new mongoose.Schema({
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
  assetType: {
    type: String,
    enum: ['agricultural', 'forestry', 'ranch', 'vineyard', 'orchard', 'other'],
    default: 'agricultural'
  },
  location: {
    country: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    size: {
      value: Number,
      unit: { type: String, enum: ['hectares', 'acres', 'sq_km'], default: 'hectares' }
    }
  },
  soilType: {
    type: String,
    enum: ['loam', 'clay', 'sandy', 'silty', 'peaty', 'chalky']
  },
  climate: {
    type: String,
    enum: ['tropical', 'subtropical', 'temperate', 'continental', 'arid']
  },
  annualYield: {
    type: Number, // percentuale di rendimento atteso
    default: 5
  },
  harvestSchedule: {
    type: String,
    enum: ['annual', 'biannual', 'quarterly', 'monthly']
  },
  mainCrops: [String],
  sustainability: {
    organic: { type: Boolean, default: false },
    regenerative: { type: Boolean, default: false },
    carbonSequestration: { type: Number, default: 0 } // tonnellate CO2/anno
  },
  status: {
    type: String,
    enum: ['available', 'sold_out', 'upcoming', 'inactive'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LandToken', LandTokenSchema);
