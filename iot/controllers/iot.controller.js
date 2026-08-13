/**
 * 🌱 IoT Controller - Gestione Sensori Orti
 */

class IoTController {
    constructor() {
        this.sensors = {
            soilMoisture: [],
            temperature: [],
            humidity: [],
            light: []
        };
        
        // Genera dati iniziali
        for (let i = 0; i < 10; i++) {
            this.sensors.soilMoisture.push({ value: 40 + Math.random() * 30, timestamp: Date.now() - i * 60000 });
            this.sensors.temperature.push({ value: 18 + Math.random() * 8, timestamp: Date.now() - i * 60000 });
            this.sensors.humidity.push({ value: 50 + Math.random() * 30, timestamp: Date.now() - i * 60000 });
            this.sensors.light.push({ value: 300 + Math.random() * 500, timestamp: Date.now() - i * 60000 });
        }
    }

    // Ottieni dati sensori
    async getSensorData(req, res) {
        try {
            const { type, limit = 10 } = req.query;
            
            if (type && this.sensors[type]) {
                const data = this.sensors[type].slice(-parseInt(limit));
                return res.json({ success: true, data });
            }
            
            const allData = {};
            for (const [key, values] of Object.entries(this.sensors)) {
                allData[key] = values.slice(-parseInt(limit));
            }
            res.json({ success: true, data: allData });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Ottieni ultimo valore
    async getLatest(req, res) {
        try {
            const { type } = req.query;
            if (type && this.sensors[type]) {
                const last = this.sensors[type][this.sensors[type].length - 1];
                return res.json({ success: true, data: last });
            }
            
            const latest = {};
            for (const [key, values] of Object.entries(this.sensors)) {
                latest[key] = values[values.length - 1];
            }
            res.json({ success: true, data: latest });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Invia dati sensore
    async sendSensorData(req, res) {
        try {
            const { type, value } = req.body;
            
            if (!type || !this.sensors[type]) {
                return res.status(400).json({ success: false, error: 'Tipo sensore non valido' });
            }
            
            this.sensors[type].push({ value, timestamp: Date.now() });
            if (this.sensors[type].length > 100) {
                this.sensors[type].shift();
            }
            
            res.json({ success: true, message: 'Dati ricevuti' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Ottieni allarmi
    async getAlerts(req, res) {
        try {
            const alerts = [];
            const latest = {};
            for (const [key, values] of Object.entries(this.sensors)) {
                latest[key] = values[values.length - 1];
            }
            
            if (latest.soilMoisture && latest.soilMoisture.value < 30) {
                alerts.push({ type: 'soil_moisture', message: '⚠️ Umidità terreno bassa', severity: 'warning' });
            }
            if (latest.temperature && latest.temperature.value > 30) {
                alerts.push({ type: 'temperature', message: '⚠️ Temperatura elevata', severity: 'warning' });
            }
            if (latest.humidity && latest.humidity.value > 80) {
                alerts.push({ type: 'humidity', message: '⚠️ Umidità aria alta', severity: 'info' });
            }
            if (latest.light && latest.light.value < 100) {
                alerts.push({ type: 'light', message: '⚠️ Poca luce', severity: 'warning' });
            }
            
            res.json({ success: true, data: alerts });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Ottieni statistiche sensori
    async getStats(req, res) {
        try {
            const stats = {};
            for (const [key, values] of Object.entries(this.sensors)) {
                const vals = values.map(v => v.value);
                stats[key] = {
                    min: Math.min(...vals),
                    max: Math.max(...vals),
                    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
                    count: vals.length
                };
            }
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = { IoTController };
