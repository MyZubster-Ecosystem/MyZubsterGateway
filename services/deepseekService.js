const axios = require('axios');
const config = require('../config/deepseek');

class DeepSeekService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async chat(prompt, options = {}) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: options.model || config.model,
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || config.maxTokens,
        temperature: options.temperature || config.temperature
      });
      return response.data;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async chatFlash(prompt, options = {}) {
    return this.chat(prompt, {
      model: config.flash.model,
      maxTokens: options.maxTokens || config.flash.maxTokens,
      temperature: options.temperature || config.flash.temperature,
      ...options
    });
  }

  async analyzeTransaction(transactionData) {
    const prompt = `
      Analizza questa transazione Monero (XMR):
      ${JSON.stringify(transactionData, null, 2)}
      
      Fornisci:
      1. Livello di rischio (basso/medio/alto)
      2. Pattern sospetti identificati
      3. Raccomandazioni per l'escrow
    `;
    return this.chatFlash(prompt, {
      systemPrompt: 'Sei un esperto di analisi transazioni Monero e sicurezza blockchain.'
    });
  }

  async evaIoniDecision(sensorData, context) {
    const prompt = `
      EVA IONI Robot Decision Engine:
      
      Dati sensori: ${JSON.stringify(sensorData)}
      Contesto: ${JSON.stringify(context)}
      
      Decidi:
      1. Azione (irrigare, raccogliere, spostarsi, riposare)
      2. Priorità (1-10)
      3. Se richiedere pagamento in XMR
    `;
    return this.chatFlash(prompt, {
      systemPrompt: 'Sei un robot agricolo intelligente che ottimizza la crescita delle piante.'
    });
  }

  async generateGalaxyMetadata(galaxyName) {
    const prompt = `
      Genera metadati per la galassia "${galaxyName}":
      
      Includi:
      - Tipo di galassia
      - Distanza dalla Terra (anni luce)
      - Costellazione
      - Diametro (migliaia di anni luce)
      - Esopianeti conosciuti
      - Caratteristiche speciali
      - Coordinate celesti
    `;
    return this.chatFlash(prompt, {
      systemPrompt: 'Sei un astronomo esperto con dati scientifici accurati.'
    });
  }

  async generatePlanetMetadata(planetName) {
    const prompt = `
      Genera metadati per il pianeta "${planetName}":
      
      Includi:
      - Tipo (roccioso, gassoso, super-terra)
      - Sistema stellare
      - Distanza dalla stella (AU)
      - Raggio (km)
      - Massa (M⊕)
      - Periodo orbitale
      - Atmosfera
      - Abitabilità
    `;
    return this.chatFlash(prompt, {
      systemPrompt: 'Sei un astrobiologo esperto di esopianeti.'
    });
  }

  async generateStarMetadata(starName) {
    const prompt = `
      Genera metadati per la stella "${starName}":
      
      Includi:
      - Tipo spettrale
      - Costellazione
      - Magnitudine
      - Distanza (anni luce)
      - Galassia di appartenenza
      - Temperatura (K)
      - Massa (M☉)
      - Raggio (R☉)
    `;
    return this.chatFlash(prompt, {
      systemPrompt: 'Sei un astrofisico specializzato in classificazione stellare.'
    });
  }
}

module.exports = new DeepSeekService();
