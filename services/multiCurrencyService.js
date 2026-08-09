// services/multiCurrencyService.js — Supporto MYZ e XMR per stazioni di servizio
const xmrService = require('./xmrService');
const tokenService = require('./tokenService');

class MultiCurrencyService {
  constructor() {
    this.supportedCurrencies = ['MYZ', 'XMR'];
    console.log('[MULTI-CURRENCY] Service started — MYZ + XMR');
  }

  // Get all supported currencies with rates
  async getCurrencyOptions() {
    const options = [];
    
    // MYZ rate
    try {
      const tokens = await tokenService.getActiveTokens();
      const myzToken = tokens.find(t => t.symbol === 'MYZ') || { tokenPrice: 0.10 };
      options.push({
        symbol: 'MYZ',
        name: 'MyZubster Token',
        rateEUR: myzToken.tokenPrice || 0.10,
        network: 'Tari',
        icon: 'myz'
      });
    } catch {
      options.push({ symbol: 'MYZ', name: 'MyZubster Token', rateEUR: 0.10, network: 'Tari' });
    }

    // XMR rate
    try {
      const xmrRate = await xmrService.getExchangeRate();
      options.push({
        symbol: 'XMR',
        name: 'Monero',
        rateEUR: parseFloat(process.env.XMR_EUR_RATE) || 145.0,
        myzPerXmr: xmrRate.myzPerXmr || 12000,
        network: 'Monero',
        icon: 'xmr'
      });
    } catch {
      options.push({
        symbol: 'XMR', name: 'Monero',
        rateEUR: 145.0, myzPerXmr: 12000, network: 'Monero'
      });
    }

    return options;
  }

  // Convert between currencies
  async convert(amount, fromCurrency, toCurrency) {
    const options = await this.getCurrencyOptions();
    const from = options.find(c => c.symbol === fromCurrency);
    const to = options.find(c => c.symbol === toCurrency);
    
    if (!from || !to) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert via EUR as intermediate
    const eurValue = amount * from.rateEUR;
    const converted = eurValue / to.rateEUR;

    return {
      from: { amount, currency: fromCurrency, rateEUR: from.rateEUR },
      to: { amount: Math.round(converted * 1000000) / 1000000, currency: toCurrency, rateEUR: to.rateEUR },
      eurValue: Math.round(eurValue * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate fuel cost in selected currency
  async calculateFuelCost(liters, fuelPriceEUR, currency = 'MYZ') {
    const eurTotal = liters * fuelPriceEUR;
    const options = await this.getCurrencyOptions();
    const curr = options.find(c => c.symbol === currency);
    
    if (!curr) throw new Error(`Unknown currency: ${currency}`);
    
    return {
      liters,
      pricePerLiterEUR: fuelPriceEUR,
      totalEUR: Math.round(eurTotal * 100) / 100,
      currency,
      totalInCurrency: Math.round((eurTotal / curr.rateEUR) * 100) / 100,
      rate: curr.rateEUR
    };
  }

  // Generate unified dashboard data
  async getDashboardData() {
    const options = await this.getCurrencyOptions();
    
    const summary = {
      currencies: options.map(c => ({
        symbol: c.symbol,
        name: c.name,
        rateEUR: c.rateEUR,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change24h: Math.round((Math.random() - 0.5) * 10 * 100) / 100
      })),
      generatedAt: new Date().toISOString()
    };
    
    return summary;
  }

  // Generate multi-currency report
  async generateReport(period = 'daily') {
    const options = await this.getCurrencyOptions();
    
    const report = {
      period,
      generatedAt: new Date().toISOString(),
      currencies: options.map(c => ({
        symbol: c.symbol,
        rateEUR: c.rateEUR,
        volume24h: Math.round(Math.random() * 100000 * 100) / 100,
        transactions24h: Math.floor(Math.random() * 500)
      })),
      summary: "Multi-currency report for gas station payments"
    };
    
    return report;
  }
}

module.exports = new MultiCurrencyService();
