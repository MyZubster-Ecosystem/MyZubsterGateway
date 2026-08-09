const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Mock data store
const analyticsData = {
    dailyActiveUsers: [120, 150, 180, 190, 210, 250, 240],
    revenue: [500, 600, 800, 750, 900, 1200, 1100],
    topEndpoints: [
        { path: '/api/benzina/xmr', count: 1543 },
        { path: '/api/robot/eva-ioni', count: 982 },
        { path: '/api/payments/fiat', count: 876 }
    ]
};

/**
 * 1. Statistiche in tempo reale
 */
router.get('/realtime', (req, res) => {
    res.json({
        success: true,
        currentActiveUsers: Math.floor(Math.random() * 50) + 10,
        transactionsPerMinute: Math.floor(Math.random() * 20),
        timestamp: new Date().toISOString()
    });
});

/**
 * 2. Report giornalieri & KPI
 */
router.get('/daily-kpi', (req, res) => {
    res.json({
        success: true,
        kpi: {
            DAU: analyticsData.dailyActiveUsers,
            RevenueMYZ: analyticsData.revenue,
            growthRate: '15.4%'
        }
    });
});

/**
 * 3. Grafici e Chart (Returns data formatted for Chart.js)
 */
router.get('/charts/activity', (req, res) => {
    res.json({
        success: true,
        chartData: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Active Users',
                    data: analyticsData.dailyActiveUsers,
                    borderColor: '#36A2EB'
                },
                {
                    label: 'Revenue (MYZ)',
                    data: analyticsData.revenue,
                    borderColor: '#FF6384'
                }
            ]
        }
    });
});

/**
 * 4. Export CSV Report
 */
router.get('/export/csv', (req, res) => {
    const csvContent = \`Date,ActiveUsers,Revenue\\n\` + 
                       analyticsData.dailyActiveUsers.map((dau, i) => \`Day\${i+1},\${dau},\${analyticsData.revenue[i]}\`).join('\\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
    res.send(csvContent);
});

module.exports = router;
