/**
 * Sensor Service - Integrazione Sensori Ambientali Avanzata
 * Bounty #1026: Integrazione Sensori Ambientali
 */
const crypto = require('crypto');

class AdvancedSensorService {
  constructor() {
    this.sensors = {};
    this.readings = [];
  }

  /**
   * Registra un nuovo sensore
   */
  registerSensor(sensorConfig) {
    const id = sensorConfig.id || `SENSOR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    this.sensors[id] = {
      id,
      type: sensorConfig.type || 'unknown',
      category: sensorConfig.category || 'generic',
      location: sensorConfig.location || {},
      unit: sensorConfig.unit || 'unit',
      range: sensorConfig.range || { min: 0, max: 100 },
      accuracy: sensorConfig.accuracy || '±1%',
      status: 'active',
      registeredAt: new Date().toISOString(),
      lastReading: null
    };
    return this.sensors[id];
  }

  /**
   * Registra una lettura da sensore
   */
  recordReading(sensorId, value, metadata = {}) {
    const sensor = this.sensors[sensorId];
    if (!sensor) return { error: 'Sensor not found' };

    const reading = {
      id: `RD-${Date.now()}`,
      sensorId,
      sensorType: sensor.type,
      category: sensor.category,
      value,
      unit: sensor.unit,
      timestamp: new Date().toISOString(),
      location: sensor.location,
      metadata
    };

    sensor.lastReading = reading;
    this.readings.push(reading);

    // Keep last 1000 readings
    if (this.readings.length > 1000) {
      this.readings = this.readings.slice(-1000);
    }

    return reading;
  }

  /**
   * Batch reading
   */
  recordBatchReadings(readings) {
    return readings.map(r => this.recordReading(r.sensorId, r.value, r.metadata));
  }

  /**
   * Dati aggregati per categoria
   */
  getReadingsByCategory(category, limit = 100) {
    return this.readings
      .filter(r => r.category === category)
      .slice(-limit);
  }

  /**
   * Ultime letture per sensore
   */
  getLatestReadings(sensorId, limit = 20) {
    return this.readings
      .filter(r => r.sensorId === sensorId)
      .slice(-limit);
  }

  /**
   * Media mobile per sensore
   */
  getMovingAverage(sensorId, window = 10) {
    const readings = this.getLatestReadings(sensorId, window);
    if (readings.length === 0) return null;
    
    const sum = readings.reduce((acc, r) => acc + r.value, 0);
    return {
      sensorId,
      window,
      average: parseFloat((sum / readings.length).toFixed(4)),
      min: Math.min(...readings.map(r => r.value)),
      max: Math.max(...readings.map(r => r.value)),
      sampleCount: readings.length,
      lastReading: readings[readings.length - 1]
    };
  }

  /**
   * Allerta superamento soglia
   */
  checkThreshold(sensorId, threshold) {
    const sensor = this.sensors[sensorId];
    if (!sensor || !sensor.lastReading) return null;

    const { value } = sensor.lastReading;
    const { min, max, warning } = threshold;

    const alerts = [];
    if (min !== undefined && value < min) {
      alerts.push({ level: 'warning', message: `Value ${value} below minimum ${min}`, sensorId, value, threshold: min });
    }
    if (max !== undefined && value > max) {
      alerts.push({ level: 'critical', message: `Value ${value} exceeds maximum ${max}`, sensorId, value, threshold: max });
    }
    if (warning !== undefined && value > warning) {
      alerts.push({ level: 'warning', message: `Value ${value} approaching limit`, sensorId, value, threshold: warning });
    }

    return alerts.length > 0 ? { alerts, reading: sensor.lastReading } : null;
  }

  /**
   * Statistiche globali sensori
   */
  getGlobalStats() {
    const categories = {};
    this.readings.forEach(r => {
      if (!categories[r.category]) {
        categories[r.category] = { count: 0, total: 0, values: [] };
      }
      categories[r.category].count++;
      categories[r.category].total += r.value;
      categories[r.category].values.push(r.value);
    });

    const result = {};
    Object.entries(categories).forEach(([cat, data]) => {
      result[cat] = {
        totalReadings: data.count,
        average: parseFloat((data.total / data.count).toFixed(4)),
        min: Math.min(...data.values),
        max: Math.max(...data.values),
        activeSensors: Object.values(this.sensors).filter(s => s.category === cat && s.status === 'active').length
      };
    });

    return {
      totalSensors: Object.keys(this.sensors).length,
      totalReadings: this.readings.length,
      categories: result,
      lastReading: this.readings.length > 0 ? this.readings[this.readings.length - 1].timestamp : null
    };
  }

  /**
   * MQTT Data ingestion simulation
   */
  simulateMQTTIngestion(topic, payload) {
    const { sensorId, value, category } = payload;
    
    // Auto-register sensor if needed
    if (!this.sensors[sensorId]) {
      this.registerSensor({
        id: sensorId,
        type: category || topic.split('/').pop(),
        category: category || 'mqtt'
      });
    }

    const reading = this.recordReading(sensorId, value, {
      source: 'mqtt',
      topic,
      ingestedAt: new Date().toISOString()
    });

    return {
      topic,
      sensorRegistered: true,
      reading
    };
  }
}

module.exports = new AdvancedSensorService();
