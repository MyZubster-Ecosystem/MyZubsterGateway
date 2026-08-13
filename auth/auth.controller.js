/**
 * 🔐 Auth Controller - Gestione Autenticazione
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');
const { generateToken, verifyToken } = require('../utils/jwt.utils');

// Registrazione utente
exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        
        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email già registrata'
            });
        }
        
        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Crea nuovo utente
        const user = new User({
            email,
            password: hashedPassword,
            name,
            role: role || 'user'
        });
        
        await user.save();
        
        // Genera token
        const token = generateToken({ id: user._id, email: user.email, role: user.role });
        const refreshToken = generateToken({ id: user._id, email: user.email }, '7d');
        
        res.status(201).json({
            success: true,
            message: 'Utente registrato con successo',
            data: {
                user: { id: user._id, email: user.email, name: user.name, role: user.role },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('❌ Errore registrazione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante la registrazione'
        });
    }
};

// Login utente
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Cerca utente
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenziali non valide'
            });
        }
        
        // Verifica password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenziali non valide'
            });
        }
        
        // Genera token
        const token = generateToken({ id: user._id, email: user.email, role: user.role });
        const refreshToken = generateToken({ id: user._id, email: user.email }, '7d');
        
        res.json({
            success: true,
            message: 'Login effettuato con successo',
            data: {
                user: { id: user._id, email: user.email, name: user.name, role: user.role },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('❌ Errore login:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il login'
        });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token richiesto'
            });
        }
        
        const decoded = verifyToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token non valido'
            });
        }
        
        const newToken = generateToken({ id: decoded.id, email: decoded.email, role: decoded.role });
        
        res.json({
            success: true,
            data: { token: newToken }
        });
    } catch (error) {
        console.error('❌ Errore refresh token:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il refresh del token'
        });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        // In una implementazione reale, aggiungi il token a una blacklist
        res.json({
            success: true,
            message: 'Logout effettuato con successo'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Errore durante il logout'
        });
    }
};
