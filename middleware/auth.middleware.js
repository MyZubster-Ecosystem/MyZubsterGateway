/**
 * 🛡️ Auth Middleware - Protezione Route
 */

const { verifyToken } = require('../utils/jwt.utils');

// Middleware per verificare il token
exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token non fornito'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Token non valido'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Errore autenticazione:', error);
        res.status(401).json({
            success: false,
            error: 'Errore di autenticazione'
        });
    }
};

// Middleware per verificare i ruoli
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Utente non autenticato'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Permessi insufficienti'
            });
        }
        
        next();
    };
};
