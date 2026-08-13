/**
 * 📝 Sistema di Registrazione Utenti
 * Con wallet MYZ e XMR integrati
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Genera indirizzo wallet MYZ
function generateMYZWallet() {
    return `myz_${crypto.randomBytes(20).toString('hex')}`;
}

// Genera indirizzo wallet XMR
function generateXMRWallet() {
    return `xmr_${crypto.randomBytes(20).toString('hex')}`;
}

class UserDatabase {
    constructor() {
        this.users = [];
        this.loadUsers();
    }

    loadUsers() {
        try {
            if (fs.existsSync(USERS_FILE)) {
                const data = fs.readFileSync(USERS_FILE, 'utf8');
                this.users = JSON.parse(data);
                console.log(`📊 Caricati ${this.users.length} utenti`);
            }
        } catch (error) {
            console.error('❌ Errore caricamento utenti:', error);
            this.users = [];
        }
    }

    saveUsers() {
        try {
            fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2));
            console.log('✅ Utenti salvati!');
        } catch (error) {
            console.error('❌ Errore salvataggio utenti:', error);
        }
    }

    async register(userData) {
        try {
            // Verifica se esiste già
            const existing = this.users.find(u => u.email === userData.email);
            if (existing) {
                return {
                    success: false,
                    error: 'Email già registrata'
                };
            }

            // Hash della password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Genera wallet
            const myzWallet = generateMYZWallet();
            const xmrWallet = generateXMRWallet();

            // Crea nuovo utente
            const newUser = {
                id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                email: userData.email,
                password: hashedPassword,
                nome: userData.nome || '',
                cognome: userData.cognome || '',
                ruolo: userData.ruolo || 'user',
                telefono: userData.telefono || '',
                citta: userData.citta || '',
                parrocchia: userData.parrocchia || '',
                // WALLET INTEGRATI
                wallet: {
                    myz: {
                        address: myzWallet,
                        balance: 0,
                        currency: 'MYZ'
                    },
                    xmr: {
                        address: xmrWallet,
                        balance: 0,
                        currency: 'XMR'
                    }
                },
                stats: {
                    piante_registrate: 0,
                    myz_guadagnati: 0,
                    orti_creati: 0,
                    transazioni: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: null,
                attivo: true,
                email_verificato: false
            };

            this.users.push(newUser);
            this.saveUsers();

            return {
                success: true,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    nome: newUser.nome,
                    cognome: newUser.cognome,
                    ruolo: newUser.ruolo,
                    wallet: newUser.wallet
                },
                message: '✅ Registrazione completata! Wallet MYZ e XMR creati.'
            };
        } catch (error) {
            console.error('❌ Errore registrazione:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async login(email, password) {
        try {
            const user = this.users.find(u => u.email === email);
            if (!user) {
                return {
                    success: false,
                    error: 'Email o password non validi'
                };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    success: false,
                    error: 'Email o password non validi'
                };
            }

            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    nome: user.nome,
                    cognome: user.cognome,
                    ruolo: user.ruolo,
                    wallet: user.wallet,
                    stats: user.stats
                },
                message: '✅ Login effettuato!'
            };
        } catch (error) {
            console.error('❌ Errore login:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    // Aggiungi MYZ al wallet
    addMYZ(userId, amount) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;

        user.wallet.myz.balance += amount;
        user.stats.myz_guadagnati += amount;
        user.stats.transazioni += 1;
        user.updatedAt = new Date().toISOString();
        this.saveUsers();
        return user;
    }

    // Aggiungi XMR al wallet
    addXMR(userId, amount) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;

        user.wallet.xmr.balance += amount;
        user.stats.transazioni += 1;
        user.updatedAt = new Date().toISOString();
        this.saveUsers();
        return user;
    }

    // Ottieni wallet utente
    getWallet(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;
        return user.wallet;
    }

    getStats() {
        const total = this.users.length;
        const attivi = this.users.filter(u => u.attivo).length;
        const totalPiante = this.users.reduce((sum, u) => sum + u.stats.piante_registrate, 0);
        const totalMYZ = this.users.reduce((sum, u) => sum + u.wallet.myz.balance, 0);
        const totalXMR = this.users.reduce((sum, u) => sum + u.wallet.xmr.balance, 0);

        return {
            total,
            attivi,
            totalPiante,
            totalMYZ,
            totalXMR,
            transazioni: this.users.reduce((sum, u) => sum + u.stats.transazioni, 0)
        };
    }
}

module.exports = { UserDatabase };
