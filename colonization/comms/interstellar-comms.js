/**
 * 📡 Interstellar Communication System
 * Sistema di comunicazione tra colonie
 */

class InterstellarComms {
  constructor() {
    this.networks = [];
    this.messages = [];
    this.channels = [];
  }

  // Crea rete
  createNetwork(name) {
    const network = {
      id: `net-${Date.now()}`,
      name,
      nodes: [],
      status: 'active',
      createdAt: new Date()
    };
    this.networks.push(network);
    return network;
  }

  // Invia messaggio
  sendMessage(from, to, content) {
    const message = {
      id: `msg-${Date.now()}`,
      from,
      to,
      content,
      sentAt: new Date(),
      status: 'sent'
    };
    this.messages.push(message);
    return message;
  }

  // Ottieni statistiche
  getStats() {
    return {
      networks: this.networks.length,
      messages: this.messages.length,
      channels: this.channels.length
    };
  }
}

module.exports = new InterstellarComms();
