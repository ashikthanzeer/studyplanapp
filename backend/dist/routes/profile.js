"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/profile
router.get('/', auth_1.authenticateToken, profileController_1.getProfile);
// PUT /api/profile
router.put('/', auth_1.authenticateToken, profileController_1.updateProfile);
// GET /api/profile/preferences
router.get('/preferences', auth_1.authenticateToken, profileController_1.getPreferences);
// PUT /api/profile/preferences
router.put('/preferences', auth_1.authenticateToken, profileController_1.updatePreferences);
// GET /api/profile/gamification
router.get('/gamification', auth_1.authenticateToken, profileController_1.getGamification);
exports.default = router;
//# sourceMappingURL=profile.js.map