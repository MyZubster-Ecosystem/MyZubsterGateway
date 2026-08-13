/**
 * 🔌 API v1 Routes - Route Pubbliche
 */

const express = require('express');
const router = express.Router();
const { apiLimiter, strictLimiter, validateApiKey, apiLogger } = require('../middleware/api.middleware');
const { Product } = require('../../../marketplace/models/marketplace.model');
const { Bounty } = require('../../../bounty/models/bounty.model');
const { SocketManager } = require('../../../notifications/websocket/socket.manager');

// Applica middleware a tutte le route
router.use(apiLogger);
router.use(validateApiKey);
router.use(apiLimiter);

// ============================================
// 🌿 API PIANTE
// ============================================

// Ottieni tutte le piante
router.get('/plants', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const plantsFile = path.join(__dirname, '../../../plants.json');
        
        if (!fs.existsSync(plantsFile)) {
            return res.json({ success: true, data: [], total: 0 });
        }
        
        const plants = JSON.parse(fs.readFileSync(plantsFile, 'utf8'));
        
        // Filtri
        let filtered = plants;
        const { species, era, location, search } = req.query;
        
        if (species) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(species.toLowerCase()));
        }
        if (era) {
            filtered = filtered.filter(p => p.year == era);
        }
        if (location) {
            filtered = filtered.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.location.toLowerCase().includes(searchLower)
            );
        }
        
        res.json({
            success: true,
            data: filtered,
            total: filtered.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Errore API piante:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ottieni pianta specifica
router.get('/plants/:id', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const plantsFile = path.join(__dirname, '../../../plants.json');
        
        if (!fs.existsSync(plantsFile)) {
            return res.status(404).json({
                success: false,
                error: 'Pianta non trovata'
            });
        }
        
        const plants = JSON.parse(fs.readFileSync(plantsFile, 'utf8'));
        const plant = plants.find(p => p.id === req.params.id);
        
        if (!plant) {
            return res.status(404).json({
                success: false,
                error: 'Pianta non trovata'
            });
        }
        
        res.json({
            success: true,
            data: plant
        });
    } catch (error) {
        console.error('❌ Errore API pianta:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 💰 API PAGAMENTI
// ============================================

// Crea pagamento
router.post('/payments/create', strictLimiter, async (req, res) => {
    try {
        const { amount, currency, description } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Importo non valido'
            });
        }
        
        // Crea pagamento
        const payment = {
            id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            amount: amount,
            currency: currency || 'MYZ',
            description: description || 'Pagamento MyZubster',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: payment,
            message: 'Pagamento creato con successo'
        });
    } catch (error) {
        console.error('❌ Errore creazione pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Verifica pagamento
router.get('/payments/:id', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const paymentsFile = path.join(__dirname, '../../../payments.json');
        
        if (!fs.existsSync(paymentsFile)) {
            return res.status(404).json({
                success: false,
                error: 'Pagamento non trovato'
            });
        }
        
        const payments = JSON.parse(fs.readFileSync(paymentsFile, 'utf8'));
        const payment = payments.find(p => p.id === req.params.id);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Pagamento non trovato'
            });
        }
        
        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('❌ Errore verifica pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 🎯 API BOUNTY
// ============================================

// Ottieni bounty aperti
router.get('/bounties', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const bountyFile = path.join(__dirname, '../../../bounties.json');
        
        if (!fs.existsSync(bountyFile)) {
            return res.json({ success: true, data: [], total: 0 });
        }
        
        const bounties = JSON.parse(fs.readFileSync(bountyFile, 'utf8'));
        const openBounties = bounties.filter(b => b.status === 'open' || b.status === 'assigned');
        
        res.json({
            success: true,
            data: openBounties,
            total: openBounties.length
        });
    } catch (error) {
        console.error('❌ Errore API bounty:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 📊 API STATISTICHE
// ============================================

// Statistiche generali
router.get('/stats', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const plantsFile = path.join(__dirname, '../../../plants.json');
        const paymentsFile = path.join(__dirname, '../../../payments.json');
        const bountyFile = path.join(__dirname, '../../../bounties.json');
        
        let plants = [];
        let payments = [];
        let bounties = [];
        
        if (fs.existsSync(plantsFile)) {
            plants = JSON.parse(fs.readFileSync(plantsFile, 'utf8'));
        }
        if (fs.existsSync(paymentsFile)) {
            payments = JSON.parse(fs.readFileSync(paymentsFile, 'utf8'));
        }
        if (fs.existsSync(bountyFile)) {
            bounties = JSON.parse(fs.readFileSync(bountyFile, 'utf8'));
        }
        
        const stats = {
            totalPlants: plants.length,
            totalPayments: payments.length,
            totalBounties: bounties.length,
            openBounties: bounties.filter(b => b.status === 'open').length,
            totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
            plantsByEra: plants.reduce((acc, p) => {
                const era = p.year || 'unknown';
                acc[era] = (acc[era] || 0) + 1;
                return acc;
            }, {}),
            lastUpdated: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Errore API statistiche:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 🛸 API VIAGGI NEL TEMPO
// ============================================

// Simula viaggio nel tempo
router.post('/timetravel', strictLimiter, async (req, res) => {
    try {
        const { destination, year } = req.body;
        
        if (!destination || !year) {
            return res.status(400).json({
                success: false,
                error: 'Destination e year sono richiesti'
            });
        }
        
        const travel = {
            id: `travel_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            destination,
            year,
            status: 'completed',
            timestamp: new Date().toISOString(),
            message: `🛸 Viaggio completato verso ${destination} (${year})`,
            flux: '1.21 GW ⚡'
        };
        
        res.json({
            success: true,
            data: travel
        });
    } catch (error) {
        console.error('❌ Errore viaggio nel tempo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 🔍 API RICERCA
// ============================================

// Ricerca globale
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Termine di ricerca richiesto'
            });
        }
        
        const fs = require('fs');
        const path = require('path');
        
        const results = {
            plants: [],
            bounties: [],
            payments: []
        };
        
        // Cerca nelle piante
        const plantsFile = path.join(__dirname, '../../../plants.json');
        if (fs.existsSync(plantsFile)) {
            const plants = JSON.parse(fs.readFileSync(plantsFile, 'utf8'));
            results.plants = plants.filter(p => 
                p.name.toLowerCase().includes(q.toLowerCase()) ||
                p.location.toLowerCase().includes(q.toLowerCase())
            );
        }
        
        // Cerca nei bounty
        const bountyFile = path.join(__dirname, '../../../bounties.json');
        if (fs.existsSync(bountyFile)) {
            const bounties = JSON.parse(fs.readFileSync(bountyFile, 'utf8'));
            results.bounties = bounties.filter(b => 
                b.title.toLowerCase().includes(q.toLowerCase()) ||
                b.description.toLowerCase().includes(q.toLowerCase())
            );
        }
        
        res.json({
            success: true,
            data: results,
            total: results.plants.length + results.bounties.length + results.payments.length,
            query: q
        });
    } catch (error) {
        console.error('❌ Errore ricerca:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
