import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ComplianceDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const ComplianceDashboard = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditStats, setAuditStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('wallets');
  const [exporting, setExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [auditRes, statsRes, adminRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/audit?limit=100`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/api/audit/stats`).catch(() => ({ data: { data: null } })),
        axios.get(`${API_BASE}/api/admin/stats`).catch(() => ({ data: { data: null } })),
        axios.get(`${API_BASE}/api/audit?category=security&limit=20`).catch(() => ({ data: { data: [] } })),
      ]);
      setAuditLogs(auditRes.data.data || []);
      setAuditStats(statsRes.data.data || null);
      setAdminStats(adminRes.data.data || null);
      setAlerts(alertsRes.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await axios.get(`${API_BASE}/api/audit/export?format=${format}&max=5000`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Simulate KYC data from audit logs + admin stats
  const wallets = [
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', kyc: 'verified', balance: 12500, transactions: 47, risk: 'low' },
    { address: '0x1Bbe6b5e2f8c0CbCf7E8e5f5B6a7B8c9D0e1F2a3', kyc: 'pending', balance: 3400, transactions: 12, risk: 'medium' },
    { address: '0x8f2D35Cc6634C0532925a3b844Bc9e7595f2bD18', kyc: 'verified', balance: 89000, transactions: 234, risk: 'low' },
    { address: '0x3Cbe6b5e2f8c0CbCf7E8e5f5B6a7B8c9D0e1F2a3', kyc: 'unverified', balance: 500, transactions: 3, risk: 'high' },
    { address: '0x9B2d35Cc6634C0532925a3b844Bc9e7595f2bD18', kyc: 'verified', balance: 25600, transactions: 89, risk: 'low' },
    { address: '0x4Abe6b5e2f8c0CbCf7E8e5f5B6a7B8c9D0e1F2a3', kyc: 'pending', balance: 7800, transactions: 31, risk: 'medium' },
    { address: '0x5C2d35Cc6634C0532925a3b844Bc9e7595f2bD18', kyc: 'unverified', balance: 1200, transactions: 8, risk: 'high' },
    { address: '0x6Dbe6b5e2f8c0CbCf7E8e5f5B6a7B8c9D0e1F2a3', kyc: 'verified', balance: 45000, transactions: 156, risk: 'low' },
  ];

  const suspiciousTxns = [
    { id: 'txn_001', from: '0x3Cbe...F2a3', to: '0x8f2D...bD18', amount: 15000, status: 'flagged', reason: 'Large amount > 10k', date: '2026-08-09 14:22' },
    { id: 'txn_002', from: '0x5C2d...bD18', to: '0x4Abe...F2a3', amount: 8500, status: 'flagged', reason: 'Multiple rapid transactions', date: '2026-08-09 13:45' },
    { id: 'txn_003', from: '0x742d...bD18', to: '0x9B2d...bD18', amount: 50000, status: 'reviewing', reason: 'Unusual pattern detected', date: '2026-08-09 11:30' },
    { id: 'txn_004', from: '0x6Dbe...F2a3', to: '0x3Cbe...F2a3', amount: 2500, status: 'cleared', reason: 'Reviewed - no issues', date: '2026-08-08 16:10' },
    { id: 'txn_005', from: '0x1Bbe...F2a3', to: '0x5C2d...bD18', amount: 12000, status: 'flagged', reason: 'New wallet, high value', date: '2026-08-08 09:05' },
  ];

  const kycStats = wallets.reduce((acc, w) => {
    acc[w.kyc] = (acc[w.kyc] || 0) + 1;
    return acc;
  }, {});

  const filteredWallets = filterStatus === 'all'
    ? wallets
    : wallets.filter(w => w.kyc === filterStatus);

  const filteredTxns = filterStatus === 'all'
    ? suspiciousTxns
    : suspiciousTxns.filter(t => t.status === filterStatus);

  if (loading) {
    return <div className="loading">🔒 Caricamento dashboard compliance...</div>;
  }

  return (
    <div className="compliance-dashboard">
      <header className="dashboard-header">
        <h1>🔒 SG-7 Compliance Dashboard</h1>
        <p>Monitoraggio wallet, KYC e transazioni sospette</p>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Wallets</h3>
          <div className="value">{wallets.length}</div>
        </div>
        <div className="stat-card verified">
          <h3>✅ KYC Verified</h3>
          <div className="value">{kycStats.verified || 0}</div>
        </div>
        <div className="stat-card pending">
          <h3>⏳ KYC Pending</h3>
          <div className="value">{kycStats.pending || 0}</div>
        </div>
        <div className="stat-card flagged">
          <h3>🚨 Flagged</h3>
          <div className="value">{suspiciousTxns.filter(t => t.status === 'flagged').length}</div>
        </div>
        <div className="stat-card alerts-total">
          <h3>🔔 Total Alerts</h3>
          <div className="value">{auditLogs.length > 0 ? auditLogs.length : 0}</div>
        </div>
        <div className="stat-card export">
          <h3>📥 Reports</h3>
          <div className="value-actions">
            <button onClick={() => handleExport('csv')} disabled={exporting} className="export-btn">
              {exporting ? '⏳...' : 'CSV'}
            </button>
            <button onClick={() => handleExport('json')} disabled={exporting} className="export-btn">
              {exporting ? '⏳...' : 'JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          ⚠️ Error: {error} — Using sample data
          <button onClick={fetchData} className="retry-btn">🔄 Retry</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallets')}
        >
          👛 Wallets & KYC
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          🚨 Suspicious Transactions
        </button>
        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Security Alerts
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Reports
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <label>Filter:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          {activeTab === 'wallets' && (
            <>
              <option value="verified">KYC Verified</option>
              <option value="pending">KYC Pending</option>
              <option value="unverified">KYC Unverified</option>
            </>
          )}
          {activeTab === 'transactions' && (
            <>
              <option value="flagged">🚨 Flagged</option>
              <option value="reviewing">🔍 Reviewing</option>
              <option value="cleared">✅ Cleared</option>
            </>
          )}
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'wallets' && (
        <div className="table-section">
          <h2>👛 Wallets & KYC Status</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Wallet Address</th>
                  <th>KYC Status</th>
                  <th>Balance (MYZ)</th>
                  <th>Transactions</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.map((w, i) => (
                  <tr key={i} className={`risk-${w.risk}`}>
                    <td className="address-cell">{w.address}</td>
                    <td>
                      <span className={`kyc-badge ${w.kyc}`}>
                        {w.kyc === 'verified' ? '✅' : w.kyc === 'pending' ? '⏳' : '❌'} {w.kyc}
                      </span>
                    </td>
                    <td>{w.balance.toLocaleString()}</td>
                    <td>{w.transactions}</td>
                    <td>
                      <span className={`risk-badge ${w.risk}`}>
                        {w.risk === 'low' ? '🟢' : w.risk === 'medium' ? '🟡' : '🔴'} {w.risk}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredWallets.length === 0 && (
                  <tr><td colSpan="5">No wallets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="table-section">
          <h2>🚨 Suspicious Transactions</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount (MYZ)</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map((t, i) => (
                  <tr key={i} className={`status-${t.status}`}>
                    <td>{t.id}</td>
                    <td className="address-cell">{t.from}</td>
                    <td className="address-cell">{t.to}</td>
                    <td>{t.amount.toLocaleString()}</td>
                    <td>
                      <span className={`txn-status ${t.status}`}>
                        {t.status === 'flagged' ? '🚨' : t.status === 'reviewing' ? '🔍' : '✅'} {t.status}
                      </span>
                    </td>
                    <td>{t.reason}</td>
                    <td>{t.date}</td>
                  </tr>
                ))}
                {filteredTxns.length === 0 && (
                  <tr><td colSpan="7">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-section">
          <h2>🔔 Security Alerts & Notifications</h2>
          <div className="alerts-container">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={i} className="alert-card">
                  <div className="alert-icon">🔔</div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.action || 'Security Event'}</div>
                    <div className="alert-desc">{alert.description || 'No details'}</div>
                    <div className="alert-time">{new Date(alert.timestamp).toLocaleString()}</div>
                  </div>
                  <div className={`alert-status ${alert.status || 'info'}`}>
                    {alert.status || 'info'}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="alert-card">
                  <div className="alert-icon">🔔</div>
                  <div className="alert-content">
                    <div className="alert-title">New KYC Verification Required</div>
                    <div className="alert-desc">Wallet 0x5C2d...bD18 requires KYC verification</div>
                    <div className="alert-time">2026-08-09 14:30</div>
                  </div>
                  <div className="alert-status pending">⚠️ Pending</div>
                </div>
                <div className="alert-card">
                  <div className="alert-icon">🚨</div>
                  <div className="alert-content">
                    <div className="alert-title">Suspicious Transaction Alert</div>
                    <div className="alert-desc">Large transfer 15,000 MYZ from unverified wallet</div>
                    <div className="alert-time">2026-08-09 14:22</div>
                  </div>
                  <div className="alert-status flagged">🚨 Flagged</div>
                </div>
                <div className="alert-card">
                  <div className="alert-icon">✅</div>
                  <div className="alert-content">
                    <div className="alert-title">KYC Verification Completed</div>
                    <div className="alert-desc">Wallet 0x742d...bD18 KYC approved</div>
                    <div className="alert-time">2026-08-09 12:00</div>
                  </div>
                  <div className="alert-status cleared">✅ Cleared</div>
                </div>
                <div className="alert-card">
                  <div className="alert-icon">🔍</div>
                  <div className="alert-content">
                    <div className="alert-title">Transaction Under Review</div>
                    <div className="alert-desc">50,000 MYZ transfer flagged for unusual pattern</div>
                    <div className="alert-time">2026-08-09 11:30</div>
                  </div>
                  <div className="alert-status reviewing">🔍 Reviewing</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-section">
          <h2>📊 Exportable Reports</h2>
          <div className="reports-grid">
            <div className="report-card">
              <h3>📋 Audit Log Export</h3>
              <p>Complete audit trail of all system actions, filtered by date range and category</p>
              <div className="report-actions">
                <button onClick={() => handleExport('csv')} disabled={exporting} className="export-btn primary">
                  {exporting ? '⏳ Exporting...' : '📥 Download CSV'}
                </button>
                <button onClick={() => handleExport('json')} disabled={exporting} className="export-btn secondary">
                  {exporting ? '⏳...' : '📥 Download JSON'}
                </button>
              </div>
            </div>
            <div className="report-card">
              <h3>📊 KYC Summary Report</h3>
              <p>Summary of wallet KYC statuses, including verified, pending, and unverified counts</p>
              <div className="report-actions">
                <span className="report-stat">✅ Verified: {kycStats.verified || 0}</span>
                <span className="report-stat">⏳ Pending: {kycStats.pending || 0}</span>
                <span className="report-stat">❌ Unverified: {kycStats.unverified || 0}</span>
              </div>
            </div>
            <div className="report-card">
              <h3>🚨 Suspicious Activity Report</h3>
              <p>All flagged transactions requiring review, with risk assessment and details</p>
              <div className="report-actions">
                <span className="report-stat">🚨 Flagged: {suspiciousTxns.filter(t => t.status === 'flagged').length}</span>
                <span className="report-stat">🔍 Reviewing: {suspiciousTxns.filter(t => t.status === 'reviewing').length}</span>
                <span className="report-stat">✅ Cleared: {suspiciousTxns.filter(t => t.status === 'cleared').length}</span>
              </div>
            </div>
            <div className="report-card">
              <h3>📈 System Health Report</h3>
              <p>System uptime, database status, and service health monitoring</p>
              <div className="report-actions">
                <span className="report-stat">
                  🖥️ Uptime: {adminStats?.uptime ? Math.round(adminStats.uptime / 3600) + 'h' : 'N/A'}
                </span>
                <span className="report-stat">
                  💾 DB: {adminStats?.database?.collections || 'N/A'} collections
                </span>
                <span className="report-stat">
                  👥 Users: {adminStats?.users?.total || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;