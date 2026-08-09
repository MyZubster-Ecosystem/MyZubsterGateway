// models/FuelReceipt.js — Ricevuta digitale rifornimento
const mongoose = require('mongoose');

const fuelReceiptSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['XMR', 'MYZ', 'EUR'], default: 'XMR' },
  fuelType: { type: String, enum: ['benzina', 'diesel', 'elettrico'], default: 'benzina' },
  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  stationName: { type: String },
  stationAddress: { type: String },
  blockchainConfirmations: { type: Number, default: 0 },
  notificationSent: { type: Boolean, default: false },
  notificationChannel: { type: String, enum: ['telegram', 'email', 'none'], default: 'none' },
  createdAt: { type: Date, default: Date.now }
});

fuelReceiptSchema.index({ receiptId: 1 });
fuelReceiptSchema.index({ userId: 1, createdAt: -1 });
fuelReceiptSchema.index({ transactionId: 1 });

module.exports = mongoose.model('FuelReceipt', fuelReceiptSchema);
