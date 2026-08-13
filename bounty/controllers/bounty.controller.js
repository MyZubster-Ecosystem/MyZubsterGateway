/**
 * 🎯 Bounty Controller - Gestione Bounty
 */

const fs = require('fs');
const path = require('path');
const { Bounty } = require('../models/bounty.model');

const BOUNTY_FILE = path.join(__dirname, '../../../bounties.json');

class BountyController {
    constructor() {
        this.bounties = [];
        this.loadBounties();
    }

    // Carica i bounty dal file
    loadBounties() {
        try {
            if (fs.existsSync(BOUNTY_FILE)) {
                const data = fs.readFileSync(BOUNTY_FILE, 'utf8');
                const bountiesData = JSON.parse(data);
                this.bounties = bountiesData.map(b => new Bounty(b));
            }
        } catch (error) {
            console.error('❌ Errore caricamento bounty:', error);
            this.bounties = [];
        }
    }

    // Salva i bounty
    saveBounties() {
        try {
            fs.writeFileSync(BOUNTY_FILE, JSON.stringify(this.bounties.map(b => b.toJSON()), null, 2));
        } catch (error) {
            console.error('❌ Errore salvataggio bounty:', error);
        }
    }

    // Crea un nuovo bounty
    async createBounty(req, res) {
        try {
            const { title, description, category, priority, bountyAmount, currency, tags, difficulty, estimatedHours } = req.body;
            
            const bounty = new Bounty({
                title,
                description,
                category: category || 'development',
                priority: priority || 'medium',
                bountyAmount: bountyAmount || 0,
                currency: currency || 'MYZ',
                createdBy: req.user.id,
                tags: tags || [],
                difficulty: difficulty || 'medium',
                estimatedHours: estimatedHours || 0
            });
            
            this.bounties.push(bounty);
            this.saveBounties();
            
            res.status(201).json({
                success: true,
                data: bounty.toJSON(),
                message: 'Bounty creato con successo'
            });
        } catch (error) {
            console.error('❌ Errore creazione bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni tutti i bounty
    async getBounties(req, res) {
        try {
            const { status, category, priority, difficulty } = req.query;
            
            let filtered = this.bounties;
            
            if (status) {
                filtered = filtered.filter(b => b.status === status);
            }
            if (category) {
                filtered = filtered.filter(b => b.category === category);
            }
            if (priority) {
                filtered = filtered.filter(b => b.priority === priority);
            }
            if (difficulty) {
                filtered = filtered.filter(b => b.difficulty === difficulty);
            }
            
            res.json({
                success: true,
                data: filtered.map(b => b.toJSON()),
                total: filtered.length
            });
        } catch (error) {
            console.error('❌ Errore recupero bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni un bounty specifico
    async getBounty(req, res) {
        try {
            const { id } = req.params;
            const bounty = this.bounties.find(b => b.id === id);
            
            if (!bounty) {
                return res.status(404).json({
                    success: false,
                    error: 'Bounty non trovato'
                });
            }
            
            res.json({
                success: true,
                data: bounty.toJSON()
            });
        } catch (error) {
            console.error('❌ Errore recupero bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Assegna bounty
    async assignBounty(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            
            const bounty = this.bounties.find(b => b.id === id);
            if (!bounty) {
                return res.status(404).json({
                    success: false,
                    error: 'Bounty non trovato'
                });
            }
            
            bounty.assignTo(userId);
            this.saveBounties();
            
            res.json({
                success: true,
                data: bounty.toJSON(),
                message: 'Bounty assegnato con successo'
            });
        } catch (error) {
            console.error('❌ Errore assegnazione bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Aggiorna stato bounty
    async updateBountyStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const bounty = this.bounties.find(b => b.id === id);
            if (!bounty) {
                return res.status(404).json({
                    success: false,
                    error: 'Bounty non trovato'
                });
            }
            
            switch(status) {
                case 'in_progress':
                    bounty.startWork();
                    break;
                case 'review':
                    bounty.complete();
                    break;
                case 'completed':
                    bounty.approve(req.user.id);
                    break;
                default:
                    bounty.status = status;
                    bounty.updatedAt = new Date().toISOString();
            }
            
            this.saveBounties();
            
            res.json({
                success: true,
                data: bounty.toJSON(),
                message: `Stato bounty aggiornato a: ${status}`
            });
        } catch (error) {
            console.error('❌ Errore aggiornamento bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Aggiungi commento
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { text } = req.body;
            
            const bounty = this.bounties.find(b => b.id === id);
            if (!bounty) {
                return res.status(404).json({
                    success: false,
                    error: 'Bounty non trovato'
                });
            }
            
            bounty.addComment(req.user.id, text);
            this.saveBounties();
            
            res.json({
                success: true,
                data: bounty.toJSON(),
                message: 'Commento aggiunto con successo'
            });
        } catch (error) {
            console.error('❌ Errore aggiunta commento:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Statistiche bounty
    async getBountyStats(req, res) {
        try {
            const total = this.bounties.length;
            const open = this.bounties.filter(b => b.status === 'open').length;
            const assigned = this.bounties.filter(b => b.status === 'assigned').length;
            const inProgress = this.bounties.filter(b => b.status === 'in_progress').length;
            const review = this.bounties.filter(b => b.status === 'review').length;
            const completed = this.bounties.filter(b => b.status === 'completed').length;
            
            const totalBounty = this.bounties.reduce((sum, b) => sum + b.bountyAmount, 0);
            const completedBounty = this.bounties
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + b.bountyAmount, 0);
            
            res.json({
                success: true,
                data: {
                    total,
                    open,
                    assigned,
                    inProgress,
                    review,
                    completed,
                    totalBounty,
                    completedBounty,
                    completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
                }
            });
        } catch (error) {
            console.error('❌ Errore statistiche bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = { BountyController };
