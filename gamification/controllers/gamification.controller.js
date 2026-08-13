/**
 * 🎮 Gamification Controller - Sistema di Gamification
 */

class GamificationController {
    constructor() {
        this.users = [];
        this.achievements = [];
        this.loadData();
    }

    loadData() {
        // In produzione, caricare da database
        this.achievements = [
            { id: 'first_plant', name: '🌱 Primo Seme', description: 'Registra la tua prima pianta', points: 10 },
            { id: 'time_traveler', name: '🛸 Viaggiatore del Tempo', description: 'Completa 5 viaggi nel tempo', points: 50 },
            { id: 'bounty_hunter', name: '🎯 Cacciatore di Bounty', description: 'Completa 3 bounty', points: 100 },
            { id: 'plant_master', name: '🌿 Maestro delle Piante', description: 'Registra 50 piante', points: 200 },
            { id: 'payment_pioneer', name: '💰 Pioniere dei Pagamenti', description: 'Effettua 10 pagamenti', points: 150 }
        ];
    }

    // Ottieni profilo utente
    async getUserProfile(req, res) {
        try {
            // Simula profilo utente
            const profile = {
                userId: req.user.id,
                level: 5,
                xp: 1250,
                nextLevelXp: 1500,
                achievements: ['first_plant', 'time_traveler'],
                stats: {
                    plants: 12,
                    payments: 5,
                    bounties: 2,
                    travels: 7
                }
            };
            
            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Ottieni classifiche
    async getLeaderboard(req, res) {
        try {
            // Simula classifiche
            const leaderboard = [
                { rank: 1, name: 'Pytho', xp: 10000, level: 50 },
                { rank: 2, name: 'GreenMaster', xp: 8500, level: 42 },
                { rank: 3, name: 'TimeWizard', xp: 7200, level: 36 }
            ];
            
            res.json({
                success: true,
                data: leaderboard
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Ottieni achievements
    async getAchievements(req, res) {
        try {
            res.json({
                success: true,
                data: this.achievements
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = { GamificationController };
