"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pomodoroController_1 = require("../controllers/pomodoroController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/pomodoro/start
router.post('/start', auth_1.authenticateToken, pomodoroController_1.createPomodoroSession);
// PUT /api/pomodoro/:id/complete
router.put('/:id/complete', auth_1.authenticateToken, pomodoroController_1.completePomodoroSession);
// PUT /api/pomodoro/:id/abandon
router.put('/:id/abandon', auth_1.authenticateToken, pomodoroController_1.abandonPomodoroSession);
// GET /api/pomodoro/history
router.get('/history', auth_1.authenticateToken, pomodoroController_1.getSessionHistory);
// GET /api/pomodoro/stats
router.get('/stats', auth_1.authenticateToken, pomodoroController_1.getSessionStats);
// GET /api/pomodoro/export
router.get('/export', auth_1.authenticateToken, pomodoroController_1.exportSessionData);
exports.default = router;
//# sourceMappingURL=pomodoro.js.map