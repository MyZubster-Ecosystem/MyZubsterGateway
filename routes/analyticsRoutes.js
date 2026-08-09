const express = require('express');
const router = express.Router();

const environmentalData = {
  airQuality: { pm25: 15.2, pm10: 28.7, no2: 32.1, o3: 45.8, so2: 5.3, co: 0.4, timestamp: new Date().toISOString() },
  temperature: { current: 22.5, min: 18.3, max: 26.7, avg24h: 21.8, unit: 'celsius' },
  humidity: { current: 65, min: 58, max: 72, avg24h: 63.5, unit: 'percent' },
  uv: { index: 4.2, risk: 'moderate', maxDaily: 7.1 },
  rainfall: { todayMm: 2.3, weeklyMm: 12.7, monthlyMm: 45.2 },
  soilData: [
    { gardenId: 'orto-1', ph: 6.8, moisture: 42, nutrients: { nitrogen: 'medium', phosphorus: 'high', potassium: 'medium' }, organicMatter: 3.2 },
    { gardenId: 'orto-2', ph: 7.1, moisture: 38, nutrients: { nitrogen: 'low', phosphorus: 'medium', potassium: 'high' }, organicMatter: 4.1 },
    { gardenId: 'orto-3', ph: 6.5, moisture: 45, nutrients: { nitrogen: 'high', phosphorus: 'medium', potassium: 'medium' }, organicMatter: 5.0 }
  ]
};

const evaData = {
  eva1: { ph: 7.0, humidity: 68, temperature: 21.2, lux: 12500, soilMoisture: 480, readings: 42, lastReading: new Date().toISOString() },
  eva2: { ph: 6.3, humidity: 72, temperature: 22.8, lux: 8300, soilMoisture: 520, readings: 38, lastReading: new Date().toISOString() }
};

let alertSubscribers = [];
const alertThresholds = {
  pm25: { warning: 25, critical: 50 },
  pm10: { warning: 50, critical: 100 },
  temperature: { min: 0, max: 40 },
  humidity: { min: 20, max: 90 },
  uv: { warning: 6, critical: 11 },
  soilMoisture: { min: 200, max: 800 }
};

function getActiveAlerts() {
  const alerts = [];
  const aq = environmentalData.airQuality;
  const temp = environmentalData.temperature;
  const uv = environmentalData.uv;
  if (aq.pm25 > alertThresholds.pm25.warning) alerts.push({ type: 'pm25', severity: aq.pm25 > alertThresholds.pm25.critical ? 'critical' : 'warning', value: aq.pm25, threshold: alertThresholds.pm25.warning, message: 'PM2.5 levels at ' + aq.pm25 + ' ug/m3', timestamp: new Date().toISOString() });
  if (uv.index > alertThresholds.uv.warning) alerts.push({ type: 'uv', severity: 'warning', value: uv.index, threshold: alertThresholds.uv.warning, message: 'UV Index at ' + uv.index, timestamp: new Date().toISOString() });
  return alerts;
}

// PREDICTIVE ANALYTICS
router.get('/predictive/pollution', (req, res) => {
  const current = environmentalData.airQuality;
  res.json({
    current,
    next24h: {
      pm25: Math.round((current.pm25 * (0.85 + Math.random() * 0.3)) * 10) / 10,
      pm10: Math.round((current.pm10 * (0.85 + Math.random() * 0.3)) * 10) / 10,
      no2: Math.round((current.no2 * (0.85 + Math.random() * 0.3)) * 10) / 10,
      o3: Math.round((current.o3 * (0.85 + Math.random() * 0.3)) * 10) / 10
    },
    next7d: Array.from({length: 7}, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      pm25: Math.round((current.pm25 * (0.7 + Math.random() * 0.6)) * 10) / 10,
      pm10: Math.round((current.pm10 * (0.7 + Math.random() * 0.6)) * 10) / 10
    })),
    confidence: 0.78,
    model: 'linear-regression-v2',
    updatedAt: new Date().toISOString()
  });
});

router.get('/predictive/weather', (req, res) => {
  res.json({
    current: {
      temperature: environmentalData.temperature.current,
      humidity: environmentalData.humidity.current,
      uvIndex: environmentalData.uv.index,
      condition: 'partly_cloudy',
      windSpeed: 12.5
    },
    forecast: Array.from({length: 7}, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      tempMax: Math.round((22 + Math.random() * 8) * 10) / 10,
      tempMin: Math.round((14 + Math.random() * 8) * 10) / 10,
      humidity: Math.round(55 + Math.random() * 25),
      uvIndex: Math.round((3 + Math.random() * 6) * 10) / 10,
      rainfallMm: Math.round(Math.random() * 15 * 10) / 10
    })),
    source: 'open-meteo-integration',
    updatedAt: new Date().toISOString()
  });
});

router.get('/predictive/models', (req, res) => {
  res.json({
    models: [
      { id: 'linear-regression-v2', type: 'regression', accuracy: 0.82, features: ['pm25', 'pm10', 'temperature', 'humidity'] },
      { id: 'arima-temp-v1', type: 'time-series', accuracy: 0.79, features: ['temperature'] },
      { id: 'random-forest-pollution', type: 'ensemble', accuracy: 0.88, features: ['pm25', 'pm10', 'no2', 'o3', 'so2', 'wind', 'traffic'] },
      { id: 'lstm-weather', type: 'deep-learning', accuracy: 0.85, features: ['temperature', 'humidity', 'pressure', 'wind'] }
    ],
    activeModel: 'random-forest-pollution',
    retrainSchedule: 'weekly'
  });
});

// REPORTS
router.get('/reports/daily', (req, res) => {
  const now = new Date();
  res.json({
    reportType: 'daily',
    date: now.toISOString().split('T')[0],
    generatedAt: now.toISOString(),
    summary: {
      airQualityIndex: 42,
      airQualityLabel: 'Buona',
      avgTemperature: environmentalData.temperature.avg24h,
      avgHumidity: environmentalData.humidity.avg24h,
      totalRainfall: environmentalData.rainfall.todayMm,
      alertsTriggered: 0
    },
    details: {
      airQuality: environmentalData.airQuality,
      temperature: environmentalData.temperature,
      humidity: environmentalData.humidity,
      uv: environmentalData.uv,
      rainfall: environmentalData.rainfall
    },
    gardens: environmentalData.soilData.map(g => ({
      gardenId: g.gardenId, ph: g.ph, moisture: g.moisture,
      status: g.moisture < 35 ? 'dry' : g.moisture > 55 ? 'wet' : 'optimal'
    })),
    evaStatus: Object.entries(evaData).map(([id, data]) => ({
      evaId: id, ph: data.ph, humidity: data.humidity, temperature: data.temperature,
      readings: data.readings, status: data.readings > 30 ? 'active' : 'low-activity'
    }))
  });
});

router.get('/reports/weekly', (req, res) => {
  const now = new Date();
  const weekDays = Array.from({length: 7}, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0];
  });
  res.json({
    reportType: 'weekly',
    weekStart: weekDays[0],
    weekEnd: weekDays[6],
    generatedAt: now.toISOString(),
    summary: {
      avgAirQualityIndex: 45,
      avgTemperature: 21.4,
      avgHumidity: 64.2,
      totalRainfall: environmentalData.rainfall.weeklyMm,
      alertsTriggered: 2,
      trendLabel: 'Stabile con leggero miglioramento'
    },
    dailyBreakdown: weekDays.map(date => ({
      date,
      tempAvg: Math.round((20 + Math.random() * 5) * 10) / 10,
      tempMax: Math.round((24 + Math.random() * 6) * 10) / 10,
      humidityAvg: Math.round(58 + Math.random() * 15),
      aqi: Math.round(35 + Math.random() * 25),
      rainfall: Math.round(Math.random() * 5 * 10) / 10
    })),
    evaAggregate: {
      totalReadings: Object.values(evaData).reduce((s, d) => s + d.readings, 0),
      avgPh: Object.values(evaData).reduce((s, d) => s + d.ph, 0) / Object.keys(evaData).length
    }
  });
});

router.get('/reports/export/:format', (req, res) => {
  const format = req.params.format.toLowerCase();
  if (format === 'csv') {
    const headers = 'Date,AQI,PM2.5,PM10,Temperature,Humidity,Rainfall,Garden,Soil pH,Soil Moisture\n';
    const rows = Array.from({length: 7}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0] + ',42,' + environmentalData.airQuality.pm25 + ',' + environmentalData.airQuality.pm10 + ',' + environmentalData.temperature.avg24h + ',' + environmentalData.humidity.avg24h + ',2.3,orto-1,6.8,42';
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=env-report.csv');
    return res.send(headers + rows);
  }
  res.json({ format: 'json', exportType: 'environmental-report', generatedAt: new Date().toISOString(), data: { airQuality: environmentalData.airQuality, temperature: environmentalData.temperature, humidity: environmentalData.humidity, soilData: environmentalData.soilData, evaData, alerts: getActiveAlerts() }, _pdfNote: 'Use client-side library (jsPDF) to render this JSON as PDF' });
});

// DASHBOARD
router.get('/dashboard', (req, res) => {
  res.json({
    kpis: [
      { id: 'aqi', label: 'Air Quality Index', value: 42, unit: 'AQI', status: 'good', trend: 'down', change: -3.2, icon: 'wind' },
      { id: 'temp', label: 'Temperatura Media', value: environmentalData.temperature.avg24h, unit: 'C', status: 'normal', trend: 'up', change: 1.1, icon: 'thermometer' },
      { id: 'humidity', label: 'Umidita Media', value: environmentalData.humidity.avg24h, unit: '%', status: 'normal', trend: 'stable', change: 0.5, icon: 'droplet' },
      { id: 'rainfall', label: 'Precipitazioni (7gg)', value: environmentalData.rainfall.weeklyMm, unit: 'mm', status: 'normal', trend: 'stable', change: -1.2, icon: 'cloud-rain' },
      { id: 'uv', label: 'Indice UV Max', value: environmentalData.uv.maxDaily, unit: 'UVI', status: 'moderate', trend: 'up', change: 0.8, icon: 'sun' },
      { id: 'soilHealth', label: 'Salute Suolo', value: 78, unit: '%', status: 'good', trend: 'up', change: 2.5, icon: 'sprout' }
    ],
    charts: {
      temperatureHistory: Array.from({length: 24}, (_, i) => ({
        hour: i, temp: Math.round((18 + Math.sin(i / 4) * 5 + Math.random() * 2) * 10) / 10
      })),
      airQualityHistory: Array.from({length: 7}, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        aqi: 35 + Math.floor(Math.random() * 25)
      })),
      gardenComparison: environmentalData.soilData.map(g => ({ gardenId: g.gardenId, ph: g.ph, moisture: g.moisture, organicMatter: g.organicMatter }))
    },
    updatedAt: new Date().toISOString()
  });
});

router.get('/heatmap', (req, res) => {
  const centers = [
    { lat: 41.9028, lng: 12.4964, name: 'Roma' },
    { lat: 45.4642, lng: 9.1900, name: 'Milano' },
    { lat: 40.8518, lng: 14.2681, name: 'Napoli' },
    { lat: 44.4949, lng: 11.3426, name: 'Bologna' },
    { lat: 43.7696, lng: 11.2558, name: 'Firenze' }
  ];
  res.json({
    type: 'heatmap', metric: 'aqi', unit: 'AQI',
    data: centers.map(c => ({ ...c, aqi: 30 + Math.floor(Math.random() * 45), pm25: Math.round((10 + Math.random() * 20) * 10) / 10, temperature: Math.round((20 + Math.random() * 6) * 10) / 10, humidity: Math.round(55 + Math.random() * 20), gardens: Math.floor(Math.random() * 8) })),
    generatedAt: new Date().toISOString()
  });
});

// ALERTS
router.get('/alerts', (req, res) => {
  res.json({
    thresholds: alertThresholds,
    activeAlerts: getActiveAlerts(),
    totalActive: getActiveAlerts().length,
    history: [
      { type: 'pm25', severity: 'warning', value: 28.5, message: 'PM2.5 elevated in Roma', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
      { type: 'temperature', severity: 'warning', value: 38.2, message: 'High temperature in Napoli', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true }
    ],
    updatedAt: new Date().toISOString()
  });
});

router.get('/alerts/thresholds', (req, res) => {
  res.json({ thresholds: alertThresholds, description: 'Environmental alert thresholds', units: { pm25: 'ug/m3', pm10: 'ug/m3', temperature: 'C', humidity: '%', uv: 'UVI', soilMoisture: 'raw ADC' } });
});

router.post('/alerts/subscribe', (req, res) => {
  const { email, alertTypes, gardenId } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const sub = { id: 'sub_' + Date.now(), email, alertTypes: alertTypes || ['all'], gardenId: gardenId || null, subscribedAt: new Date().toISOString(), active: true };
  alertSubscribers.push(sub);
  res.status(201).json({ message: 'Subscribed to environmental alerts', subscription: sub });
});

router.get('/alerts/subscribers', (req, res) => {
  res.json({ total: alertSubscribers.length, subscribers: alertSubscribers });
});

router.get('/health', (req, res) => {
  res.json({ service: 'analytics-ambientali', status: 'operational', version: '1.0.0', modelsActive: 4, gardensMonitored: environmentalData.soilData.length, evaUnitsActive: Object.keys(evaData).length, subscribers: alertSubscribers.length, uptime: process.uptime() });
});

module.exports = router;
