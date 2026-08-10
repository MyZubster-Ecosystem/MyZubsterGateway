/**
 * 🛡️ Space Defense System
 * Sistema di difesa per colonie spaziali
 */

class SpaceDefense {
  constructor() {
    this.shields = [];
    this.threats = [];
    this.defenses = [];
    this.status = 'active';
    this.alertLevel = 'green';
  }

  // Attiva scudo
  activateShield(colonyId, type) {
    const shield = {
      id: `shield-${Date.now()}`,
      colony: colonyId,
      type: type || 'energy',
      strength: 100,
      status: 'active',
      activatedAt: new Date()
    };
    this.shields.push(shield);
    return shield;
  }

  // Rileva minaccia
  detectThreat(type, level) {
    const threat = {
      id: `threat-${Date.now()}`,
      type,
      level: level || 'medium',
      status: 'monitoring',
      detectedAt: new Date()
    };
    this.threats.push(threat);
    this.alertLevel = level === 'high' ? 'red' : 'yellow';
    return threat;
  }

  // Ottieni statistiche
  getStats() {
    return {
      shields: this.shields.length,
      threats: this.threats.length,
      alertLevel: this.alertLevel,
      status: this.status
    };
  }
}

module.exports = new SpaceDefense();
