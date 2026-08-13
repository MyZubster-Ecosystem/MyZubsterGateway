/**
 * 📊 Dashboard Controller - Gestione Dashboard
 */

const fs = require('fs');
const path = require('path');

class DashboardController {
    constructor() {
        this.paymentsFile = path.join(__dirname, '../../payments.json');
        this.plantsFile = path.join(__dirname, '../../plants.json');
    }

    // Ottieni statistiche generali
    async getStats(req, res) {
        try {
            const payments = this.getPayments();
            const plants = this.getPlants();
            
            const stats = {
                totalPayments: payments.length,
                totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
                pendingPayments: payments.filter(p => p.status === 'pending').length,
                completedPayments: payments.filter(p => p.status === 'completed').length,
                totalPlants: plants.length,
                plantsByEra: this.getPlantsByEra(plants),
                recentActivity: this.getRecentActivity(payments, plants),
                revenue: {
                    daily: this.getDailyRevenue(payments),
                    weekly: this.getWeeklyRevenue(payments),
                    monthly: this.getMonthlyRevenue(payments)
                }
            };
            
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Errore statistiche:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni i pagamenti
    getPayments() {
        try {
            if (fs.existsSync(this.paymentsFile)) {
                return JSON.parse(fs.readFileSync(this.paymentsFile, 'utf8'));
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    // Ottieni le piante
    getPlants() {
        try {
            if (fs.existsSync(this.plantsFile)) {
                return JSON.parse(fs.readFileSync(this.plantsFile, 'utf8'));
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    // Piante per epoca
    getPlantsByEra(plants) {
        const eras = {};
        plants.forEach(plant => {
            const era = plant.year || 0;
            if (!eras[era]) {
                eras[era] = 0;
            }
            eras[era]++;
        });
        return eras;
    }

    // Attività recente
    getRecentActivity(payments, plants) {
        const activities = [];
        
        // Aggiungi pagamenti recenti
        payments.slice(-5).forEach(p => {
            activities.push({
                type: 'payment',
                description: `Pagamento di ${p.amount} ${p.currency || 'MYZ'}`,
                status: p.status,
                timestamp: p.createdAt || new Date().toISOString()
            });
        });
        
        // Aggiungi piante recenti
        plants.slice(-5).forEach(p => {
            activities.push({
                type: 'plant',
                description: `Nuova pianta registrata: ${p.name}`,
                location: p.location,
                timestamp: p.timestamp || new Date().toISOString()
            });
        });
        
        // Ordina per data (più recente prima)
        return activities.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 10);
    }

    // Revenue giornaliero
    getDailyRevenue(payments) {
        const today = new Date().toDateString();
        return payments
            .filter(p => new Date(p.createdAt).toDateString() === today)
            .reduce((sum, p) => sum + p.amount, 0);
    }

    // Revenue settimanale
    getWeeklyRevenue(payments) {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return payments
            .filter(p => new Date(p.createdAt) >= weekAgo)
            .reduce((sum, p) => sum + p.amount, 0);
    }

    // Revenue mensile
    getMonthlyRevenue(payments) {
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        return payments
            .filter(p => new Date(p.createdAt) >= monthAgo)
            .reduce((sum, p) => sum + p.amount, 0);
    }

    // Ottieni utenti (semplificato)
    async getUsers(req, res) {
        try {
            // Qui si integrerebbe con il database degli utenti
            res.json({
                success: true,
                data: {
                    users: [
                        { id: 1, name: 'Admin', email: 'admin@myzubster.com', role: 'admin' },
                        { id: 2, name: 'User1', email: 'user1@myzubster.com', role: 'user' }
                    ],
                    total: 2
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Esporta report
    async exportReport(req, res) {
        try {
            const payments = this.getPayments();
            const plants = this.getPlants();
            
            const report = {
                generated: new Date().toISOString(),
                summary: {
                    totalPayments: payments.length,
                    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
                    totalPlants: plants.length
                },
                payments: payments.slice(-20),
                plants: plants.slice(-20)
            };
            
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = { DashboardController };
