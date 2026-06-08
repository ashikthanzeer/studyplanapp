"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../db/connection");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        // Allow email verification, resend, logout, and getting user profile info
        const path = req.baseUrl + req.path;
        const isAllowedUnverified = path.includes('/verify-email') ||
            path.includes('/resend-verification') ||
            path.includes('/logout') ||
            (path === '/api/auth/profile' && req.method === 'GET');
        if (!isAllowedUnverified) {
            const userRes = await (0, connection_1.query)('SELECT is_verified FROM users WHERE id = $1', [decoded.id]);
            if (userRes.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (!userRes.rows[0].is_verified) {
                return res.status(403).json({
                    error: 'Email verification required',
                    is_verified: false
                });
            }
        }
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map