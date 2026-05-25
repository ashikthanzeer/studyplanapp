"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', authController_1.register);
// POST /api/auth/login
router.post('/login', authController_1.login);
// GET /api/auth/profile
router.get('/profile', auth_1.authenticateToken, authController_1.getUserProfile);
// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});
// POST /api/auth/refresh-token
router.post('/refresh-token', auth_1.authenticateToken, (req, res) => {
    res.json({ message: 'Token refresh endpoint' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map