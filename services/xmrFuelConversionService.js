// services/xmrFuelConversionService.js - Conversione XMR → Litri Benzina
const xmrService = require('./xmrService');
const mongoose = require('mongoose');

// History storage using MongoDB (in-memory fallback if no DB)
const conversionHistory = [];

const fuelPriceSchema = new mongoose.Schema({
  fuelType: { type: String, enum: ['benzina', 'diesel', 'elettrico'], default: 'benzina' },
  pricePerLiter: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  source: { type: String, default: 'manual' },
  updatedAt: { type: Date, default: Date.now }
});

let FuelPrice;
try {
  FuelPrice = mongoose.model('FuelPrice');
} catch {
  FuelPrice = mongoose.model('FuelPrice', fuelPriceSchema);
}

class XmrFuelConversionService {
  constructor() {
    this.defaultFuelPrice = parseFloat(process.env.FUEL_PRICE_EUR) || 1.85;
    this.priceHistory = [];
    console.log('[XMR-FUEL] Conversion service initialized');
  }

  // Get current XMR exchange rate (EUR)
  async getXmrRate() {
    try {
      const rate = await xmrService.getExchangeRate();
      // Use CoinGecko or similar for real XMR/EUR if available
      return { xmrEur: parseFloat(process.env.XMR_EUR_RATE) || 145.0, ...rate };
    } catch {
      return { xmrEur: parseFloat(process.env.XMR_EUR_RATE) || 145.0, myzPerXmr: 12000 };
    }
  }

  // Calculate liters from XMR amount
  async xmrToLiters(xmrAmount, fuelType = 'benzina') {
    const { xmrEur } = await this.getXmrRate();
    const eurValue = xmrAmount * xmrEur;
    const pricePerLiter = await this.getFuelPrice(fuelType);
    const liters = eurValue / pricePerLiter;

    const conversion = {
      xmrAmount,
      eurValue: Math.round(eurValue * 100) / 100,
      pricePerLiter,
      liters: Math.round(liters * 100) / 100,
      fuelType,
      timestamp: new Date().toISOString()
    };
    conversionHistory.push(conversion);
    if (conversionHistory.length > 1000) conversionHistory.shift();

    return conversion;
  }

  // Get current fuel price
  async getFuelPrice(fuelType = 'benzina') {
    try {
      const latest = await FuelPrice.findOne({ fuelType }).sort({ updatedAt: -1 });
      if (latest) return latest.pricePerLiter;
    } catch {}
    return this.defaultFuelPrice;
  }

  // Update fuel price
  async updateFuelPrice(fuelType, pricePerLiter, source = 'api') {
    try {
      const price = await FuelPrice.create({ fuelType, pricePerLiter, source });
      this.priceHistory.push({ fuelType, price: pricePerLiter, timestamp: new Date().toISOString() });
      return price;
    } catch (e) {
      return { error: e.message };
    }
  }

  // Get conversion history
  getConversionHistory(limit = 50) {
    return conversionHistory.slice(-limit).reverse();
  }

  // Auto-update fuel prices from external source (simulated)
  async autoUpdatePrices() {
    const types = ['benzina', 'diesel', 'elettrico'];
    for (const ft of types) {
      const price = this.defaultFuelPrice + (Math.random() - 0.5) * 0.05;
      await this.updateFuelPrice(ft, Math.round(price * 100) / 100, 'auto');
    }
    return { updated: types, timestamp: new Date().toISOString() };
  }
}

module.exports = new XmrFuelConversionService();
