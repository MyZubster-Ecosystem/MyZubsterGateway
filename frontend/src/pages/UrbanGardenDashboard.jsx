import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UrbanGardenDashboard.css';
import { useTranslation } from '../contexts/LanguageContext.jsx';

const UrbanGardenDashboard = () => {
  const { t } = useTranslation();
  const [gardenData, setGardenData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gardenId, setGardenId] = useState('orto-rimini-001');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Aggiorna ogni minuto
    return () => clearInterval(interval);
  }, [gardenId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, latestRes, statsRes] = await Promise.all([
        axios.get(`/api/sensors/garden/${gardenId}`),
        axios.get(`/api/sensors/garden/${gardenId}/latest`),
        axios.get(`/api/sensors/garden/${gardenId}/stats`)
      ]);
      
      setGardenData(historyRes.data.data || []);
      setLatestData(latestRes.data.data || null);
      setStats(statsRes.data.data || null);
    } catch (error) {
      console.error('Error fetching garden data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading" data-i18n="garden">{t('garden.loading')}</div>;
  }

  return (
    <div className="urban-garden-dashboard" data-i18n="garden">
      <header className="dashboard-header">
        <h1>{t('garden.title')}</h1>
        <p>{t('garden.subtitle')}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card ph">
          <h3>{t('garden.ph')}</h3>
          <div className="value">{latestData?.ph || '--'}</div>
          <div className="range">{t('garden.phRange')}</div>
        </div>
        
        <div className="stat-card ec">
          <h3>{t('garden.ec')}</h3>
          <div className="value">{latestData?.ec || '--'}</div>
          <div className="range">{t('garden.ecRange')}</div>
        </div>
        
        <div className="stat-card temperature">
          <h3>{t('garden.temperature')}</h3>
          <div className="value">{latestData?.temperature || '--'}°C</div>
          <div className="range">{t('garden.tempRange')}</div>
        </div>
        
        <div className="stat-card humidity">
          <h3>{t('garden.humidity')}</h3>
          <div className="value">{latestData?.humidity || '--'}%</div>
          <div className="range">{t('garden.humidityRange')}</div>
        </div>
      </div>

      <div className="history-section">
        <h2>{t('garden.history')}</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('garden.dataTime')}</th>
                <th>pH</th>
                <th>EC</th>
                <th>{t('garden.temperature')}</th>
                <th>{t('garden.humidity')}</th>
              </tr>
            </thead>
            <tbody>
              {gardenData.slice(0, 20).map((reading, index) => (
                <tr key={index}>
                  <td>{new Date(reading.timestamp).toLocaleString()}</td>
                  <td>{reading.ph}</td>
                  <td>{reading.ec}</td>
                  <td>{reading.temperature}°C</td>
                  <td>{reading.humidity}%</td>
                </tr>
              ))}
              {gardenData.length === 0 && (
                <tr>
                  <td colSpan="5">{t('garden.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-section">
        <h2>{t('garden.stats')}</h2>
        {stats ? (
          <div className="stats-details">
            <div>
              <strong>{t('garden.avgPh')}</strong> {stats.ph?.avg?.toFixed(2) || '--'}
            </div>
            <div>
              <strong>{t('garden.avgEc')}</strong> {stats.ec?.avg?.toFixed(2) || '--'}
            </div>
            <div>
              <strong>{t('garden.avgTemp')}</strong> {stats.temperature?.avg?.toFixed(1) || '--'}°C
            </div>
            <div>
              <strong>{t('garden.totalReadings')}</strong> {stats.readings || 0}
            </div>
          </div>
        ) : (
          <p>{t('garden.statsNotAvailable')}</p>
        )}
      </div>
    </div>
  );
};

export default UrbanGardenDashboard;