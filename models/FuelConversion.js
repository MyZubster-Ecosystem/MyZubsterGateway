// models/FuelConversion.js - Storico conversioni XMR → Carburante
const mongoose = require('mongoose');

const fuelConversionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stazioneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stazione' },
  xmrAmount: { type: Number, required: true },
  eurValue: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  liters: { type: Number, required: true },
  fuelType: { type: String, enum: ['benzina', 'diesel', 'elettrico'], default: 'benzina' },
  xmrTxId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

fuelConversionSchema.index({ userId: 1, createdAt: -1 });
fuelConversionSchema.index({ stazioneId: 1, createdAt: -1 });

module.exports = mongoose.model('FuelConversion', fuelConversionSchema);
