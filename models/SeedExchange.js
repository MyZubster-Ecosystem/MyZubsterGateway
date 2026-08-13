const mongoose = require('mongoose');

const SeedExchangeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plantName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    type: {
      type: String,
      required: true,
      enum: ['seeds', 'cuttings', 'seedlings', 'bulbs'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
      validate: {
        validator: Number.isInteger,
        message: 'quantity must be an integer',
      },
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
      index: true,
    },
    // Optional coordinates so GeoJSON export can place listings on a map.
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    availability: {
      type: String,
      enum: ['immediate', 'seasonal'],
      default: 'immediate',
      index: true,
    },
    exchangeType: {
      type: String,
      enum: ['free', 'barter', 'donation'],
      default: 'free',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  { timestamps: true }
);

SeedExchangeSchema.index({ plantName: 1, type: 1, location: 1, createdAt: -1 });

module.exports = mongoose.models.SeedExchange || mongoose.model('SeedExchange', SeedExchangeSchema);
