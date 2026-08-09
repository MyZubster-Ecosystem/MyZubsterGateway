// services/stationAppService.js — App per stazioni di servizio XMR
const mongoose = require('mongoose');

class StationAppService {
  constructor() {
    this.stations = new Map();
    console.log('[STATION-APP] Service initialised');
  }

  // Register a new gas station
  async registerStation(data) {
    const { nome, indirizzo, lat, lng, walletAddress } = data;
    
    if (!nome || !indirizzo || !walletAddress) {
      throw new Error('nome, indirizzo e walletAddress obbligatori');
    }

    const stationId = `STZ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const station = {
      id: stationId,
      nome,
      indirizzo,
      posizione: { lat: lat || 0, lng: lng || 0 },
      walletAddress,
      pagamentiAccettati: data.pagamentiAccettati || ['XMR'],
      prezzi: {
        benzina: data.prezzoBenzina || 1.85,
        diesel: data.prezzoDiesel || 1.75,
        elettrico: data.prezzoElettrico || 0.55
      },
      carburanteDisponibile: {
        benzina: data.capacitaBenzina || 10000,
        diesel: data.capacitaDiesel || 8000
      },
      aperto: true,
      transazioniTotali: 0,
      volumeTotaleXMR: 0,
      commissioniTotali: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.stations.set(stationId, station);
    
    // Persist to MongoDB if available
    try {
      const Stazione = mongoose.model('Stazione');
      await Stazione.create({
        nome, indirizzo,
        posizione: { lat: lat || 0, lng: lng || 0 },
        prezzi: station.prezzi,
        pagamentiAccettati: station.pagamentiAccettati,
        walletAddress,
        blockchain: 'XMR',
        carburanteDisponibile: station.carburanteDisponibile
      });
    } catch (e) {
      console.log('[STATION-APP] MongoDB save skipped:', e.message);
    }

    return station;
  }

  // Get station revenue dashboard
  async getRevenueDashboard(stationId) {
    const station = this.stations.get(stationId);
    if (!station) return null;

    // Simulated revenue data (in production: query blockchain)
    const xmrRate = parseFloat(process.env.XMR_EUR_RATE) || 145.0;

    return {
      stationId,
      nome: station.nome,
      indirizzo: station.indirizzo,
      stats: {
        transazioniTotali: station.transazioniTotali,
        volumeXMR: Math.round(station.volumeTotaleXMR * 10000) / 10000,
        volumeEUR: Math.round(station.volumeTotaleXMR * xmrRate * 100) / 100,
        commissioniTotali: Math.round(station.commissioniTotali * 10000) / 10000,
        ultimaTransazione: station.lastActivity
      },
      prezzi: station.prezzi,
      carburante: station.carburanteDisponibile,
      status: station.aperto ? 'open' : 'closed'
    };
  }

  // Get transaction history for a station
  async getTransactionHistory(stationId, limit = 50) {
    const station = this.stations.get(stationId);
    if (!station) return [];

    // Simulated transaction history
    const history = [];
    for (let i = 0; i < Math.min(limit, 20); i++) {
      const hrsAgo = Math.random() * 72;
      history.push({
        id: `TX-${Date.now()}-${i}`,
        stationId,
        amount: Math.round((Math.random() * 0.5 + 0.01) * 100000) / 100000,
        currency: 'XMR',
        liters: Math.round(Math.random() * 50 * 100) / 100,
        fuelType: ['benzina', 'diesel'][Math.floor(Math.random() * 2)],
        timestamp: new Date(Date.now() - hrsAgo * 3600000).toISOString(),
        status: 'confirmed',
        confirmations: Math.floor(Math.random() * 15) + 1
      });
    }
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get current XMR exchange rate
  async getXmrRate() {
    const eurRate = parseFloat(process.env.XMR_EUR_RATE) || 145.0;
    return {
      xmrEur: eurRate,
      myzPerXmr: 12000,
      lastUpdated: new Date().toISOString(),
      source: 'config'
    };
  }

  // List all registered stations
  listStations() {
    return Array.from(this.stations.values()).map(s => ({
      id: s.id,
      nome: s.nome,
      indirizzo: s.indirizzo,
      aperto: s.aperto,
      transazioniTotali: s.transazioniTotali
    }));
  }
}

module.exports = new StationAppService();
