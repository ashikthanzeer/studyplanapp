"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kanbanController_1 = require("../controllers/kanbanController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/kanban/columns
router.get('/columns', auth_1.authenticateToken, kanbanController_1.getColumns);
// POST /api/kanban/columns
router.post('/columns', auth_1.authenticateToken, kanbanController_1.createColumn);
// PUT /api/kanban/columns/:id
router.put('/columns/:id', auth_1.authenticateToken, kanbanController_1.updateColumn);
// DELETE /api/kanban/columns/:id
router.delete('/columns/:id', auth_1.authenticateToken, kanbanController_1.deleteColumn);
// POST /api/kanban/move-task
router.post('/move-task', auth_1.authenticateToken, kanbanController_1.moveTaskToColumn);
// GET /api/kanban/columns/:columnId/tasks
router.get('/columns/:columnId/tasks', auth_1.authenticateToken, kanbanController_1.getColumnTasks);
exports.default = router;
//# sourceMappingURL=kanban.js.map