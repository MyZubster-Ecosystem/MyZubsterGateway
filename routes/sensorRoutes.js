const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================
// Integrazione Sensori Ambientali - Futura
// Issue #1026 - Reward: 700 MYZ
// ============================================================

// In-memory sensor data stores
const airSensors = {};
const waterSensors = {};
const soilSensors = {};
const telemetryStream = [];
const mqttTopics = {};

// ▸▸▸ 1. SENSORI ARIA

// Registra sensore aria
router.post('/sensors/air/register', (req, res) => {
  const { stationId, location, manufacturer, elevation } = req.body || {};
  if (!stationId) {
    return res.status(400).json({ error: 'stationId obbligatorio', ok: false });
  }
  const sensorId = `AIR-${stationId}-${Date.now()}`;
  airSensors[sensorId] = {
    sensorId,
    stationId,
    location: location || { lat: 0, lon: 0 },
    manufacturer: manufacturer || 'Futura IoT',
    elevation: elevation || 0,
    status: 'online',
    registeredAt: new Date().toISOString(),
    lastReading: null,
    readings: []
  };
  res.status(201).json({ ok: true, sensor: airSensors[sensorId] });
});

// Invia lettura sensore aria (PM10, PM2.5, NO2, CO2, O3)
router.post('/sensors/air/:sensorId/reading', (req, res) => {
  const sensor = airSensors[req.params.sensorId];
  if (!sensor) return res.status(404).json({ error: 'Sensore non trovato', ok: false });

  const { pm10, pm25, no2, co2, o3, temperature, humidity } = req.body || {};
  const reading = {
    readingId: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    pm10: parseFloat(pm10) || null,
    pm25: parseFloat(pm25) || null,
    no2: parseFloat(no2) || null,
    co2: parseFloat(co2) || null,
    o3: parseFloat(o3) || null,
    temperature: parseFloat(temperature) || null,
    humidity: parseFloat(humidity) || null
  };

  sensor.readings.push(reading);
  sensor.lastReading = reading;
  telemetryStream.push({ type: 'air', sensorId: req.params.sensorId, ...reading });

  // AQI calculation (simplified)
  let aqi = 0;
  if (reading.pm25 !== null) {
    if (reading.pm25 <= 12) aqi = Math.max(aqi, Math.round((reading.pm25 / 12) * 50));
    else if (reading.pm25 <= 35.4) aqi = Math.max(aqi, Math.round(50 + ((reading.pm25 - 12) / 23.4) * 50));
    else aqi = Math.max(aqi, Math.round(100 + ((reading.pm25 - 35.4) / 15) * 50));
  }

  res.status(201).json({
    ok: true,
    reading,
    aqi,
    aqiLevel: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy',
    readingsCount: sensor.readings.length
  });
});

// Query stazioni monitoraggio aria
router.get('/sensors/air/stations', (req, res) => {
  const stations = Object.values(airSensors).map(s => ({
    sensorId: s.sensorId,
    stationId: s.stationId,
    location: s.location,
    status: s.status,
    lastReading: s.lastReading ? {
      pm25: s.lastReading.pm25,
      pm10: s.lastReading.pm10,
      co2: s.lastReading.co2,
      timestamp: s.lastReading.timestamp
    } : null,
    readingsCount: s.readings.length
  }));
  res.json({ ok: true, count: stations.length, stations });
});

// ▸▸▸ 2. SENSORI ACQUA

// Registra sensore acqua
router.post('/sensors/water/register', (req, res) => {
  const { waterBody, location, type } = req.body || {};
  const sensorId = `WTR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  waterSensors[sensorId] = {
    sensorId,
    waterBody: waterBody || 'unknown',
    location: location || {},
    type: type || 'river',
    status: 'online',
    registeredAt: new Date().toISOString(),
    readings: []
  };
  res.status(201).json({ ok: true, sensor: waterSensors[sensorId] });
});

// Invia lettura sensore acqua (pH, ossigeno, temperatura)
router.post('/sensors/water/:sensorId/reading', (req, res) => {
  const sensor = waterSensors[req.params.sensorId];
  if (!sensor) return res.status(404).json({ error: 'Sensore non trovato', ok: false });

  const { ph, dissolvedOxygen, temperature, turbidity, conductivity } = req.body || {};
  const reading = {
    readingId: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    ph: parseFloat(ph) || null,
    dissolvedOxygen: parseFloat(dissolvedOxygen) || null,
    temperature: parseFloat(temperature) || null,
    turbidity: parseFloat(turbidity) || null,
    conductivity: parseFloat(conductivity) || null
  };

  sensor.readings.push(reading);
  sensor.lastReading = reading;
  telemetryStream.push({ type: 'water', sensorId: req.params.sensorId, ...reading });

  // Water quality index (simplified)
  let quality = 'unknown';
  if (reading.ph !== null && reading.dissolvedOxygen !== null) {
    const phOk = reading.ph >= 6.5 && reading.ph <= 8.5;
    const doOk = reading.dissolvedOxygen >= 5;
    quality = phOk && doOk ? 'good' : phOk || doOk ? 'fair' : 'poor';
  }

  res.status(201).json({ ok: true, reading, waterQuality: quality, readingsCount: sensor.readings.length });
});

// ▸▸▸ 3. SENSORI SUOLO

// Registra sensore suolo
router.post('/sensors/soil/register', (req, res) => {
  const { plotId, location, cropType } = req.body || {};
  const sensorId = `SOIL-${plotId || 'gen'}-${Date.now()}`;
  soilSensors[sensorId] = {
    sensorId,
    plotId: plotId || 'unknown',
    location: location || {},
    cropType: cropType || 'general',
    status: 'online',
    registeredAt: new Date().toISOString(),
    readings: []
  };
  res.status(201).json({ ok: true, sensor: soilSensors[sensorId] });
});

// Invia lettura sensore suolo
router.post('/sensors/soil/:sensorId/reading', (req, res) => {
  const sensor = soilSensors[req.params.sensorId];
  if (!sensor) return res.status(404).json({ error: 'Sensore non trovato', ok: false });

  const { moisture, ph, temperature, nitrogen, phosphorus, potassium } = req.body || {};
  const reading = {
    readingId: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    moisture: parseFloat(moisture) || null,
    ph: parseFloat(ph) || null,
    temperature: parseFloat(temperature) || null,
    nitrogen: parseFloat(nitrogen) || null,
    phosphorus: parseFloat(phosphorus) || null,
    potassium: parseFloat(potassium) || null
  };

  sensor.readings.push(reading);
  sensor.lastReading = reading;
  telemetryStream.push({ type: 'soil', sensorId: req.params.sensorId, ...reading });

  // Soil health score
  const score = [
    reading.ph !== null && reading.ph >= 6.0 && reading.ph <= 7.5 ? 25 : 10,
    reading.moisture !== null && reading.moisture >= 20 && reading.moisture <= 60 ? 25 : 10,
    reading.nitrogen !== null ? 25 : 0,
    reading.phosphorus !== null ? 25 : 0
  ].reduce((a, b) => a + b, 0);

  res.status(201).json({ ok: true, reading, soilHealthScore: score, readingsCount: sensor.readings.length });
});

// ▸▸▸ 4. MQTT & IoT INTEGRATION

// MQTT topic subscription (mock)
router.post('/mqtt/subscribe', (req, res) => {
  const { topic, sensorId, qos } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic obbligatorio', ok: false });

  const subId = crypto.randomBytes(6).toString('hex');
  mqttTopics[subId] = {
    subId,
    topic,
    sensorId: sensorId || null,
    qos: qos || 0,
    subscribedAt: new Date().toISOString(),
    messageCount: 0
  };
  res.status(201).json({ ok: true, subscription: mqttTopics[subId] });
});

// MQTT publish (mock)
router.post('/mqtt/publish', (req, res) => {
  const { topic, payload, retain } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic obbligatorio', ok: false });

  const subs = Object.values(mqttTopics).filter(s => {
    const regex = new RegExp('^' + s.topic.replace(/\+/g, '[^/]+').replace(/#/g, '.*') + '$');
    return regex.test(topic);
  });

  subs.forEach(s => s.messageCount++);

  res.json({
    ok: true,
    topic,
    deliveredTo: subs.length,
    subscriptions: subs.map(s => ({ subId: s.subId, topic: s.topic })),
    retain: retain || false
  });
});

// Real-time data streaming endpoint (SSE mock)
router.get('/stream/realtime', (req, res) => {
  const { type, limit } = req.query;
  let data = [...telemetryStream];
  if (type) data = data.filter(d => d.type === type);
  const maxResults = parseInt(limit) || 20;
  data = data.slice(-maxResults);

  res.json({
    ok: true,
    streamType: 'SSE',
    totalEvents: telemetryStream.length,
    filterType: type || 'all',
    events: data
  });
});

// Data ingestion: batch upload
router.post('/ingestion/batch', (req, res) => {
  const { readings } = req.body || {};
  if (!readings || !Array.isArray(readings)) {
    return res.status(400).json({ error: 'readings array obbligatorio', ok: false });
  }

  const ingested = [];
  for (const r of readings) {
    const id = crypto.randomBytes(8).toString('hex');
    ingested.push({ ...r, id, ingestedAt: new Date().toISOString() });
    telemetryStream.push(r);
  }

  res.status(201).json({
    ok: true,
    ingested: ingested.length,
    totalEvents: telemetryStream.length,
    samples: ingested.slice(0, 5)
  });
});

// Sensor fleet health
router.get('/sensors/health', (req, res) => {
  const allSensors = {
    air: Object.values(airSensors).length,
    water: Object.values(waterSensors).length,
    soil: Object.values(soilSensors).length
  };
  const onlineAir = Object.values(airSensors).filter(s => s.status === 'online').length;
  const onlineWater = Object.values(waterSensors).filter(s => s.status === 'online').length;
  const onlineSoil = Object.values(soilSensors).filter(s => s.status === 'online').length;

  res.json({
    ok: true,
    fleet: {
      total: allSensors.air + allSensors.water + allSensors.soil,
      byType: allSensors,
      online: onlineAir + onlineWater + onlineSoil,
      uptime: allSensors.air + allSensors.water + allSensors.soil > 0
        ? Math.round(((onlineAir + onlineWater + onlineSoil) / (allSensors.air + allSensors.water + allSensors.soil)) * 100)
        : 100
    },
    mqttSubscriptions: Object.keys(mqttTopics).length,
    telemetryEvents: telemetryStream.length
  });
});

module.exports = router;
