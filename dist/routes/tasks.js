"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/tasks
router.get('/', auth_1.authenticateToken, taskController_1.getTasks);
// POST /api/tasks
router.post('/', auth_1.authenticateToken, taskController_1.createTask);
// GET /api/tasks/:id
router.get('/:id', auth_1.authenticateToken, taskController_1.getTaskById);
// PUT /api/tasks/:id
router.put('/:id', auth_1.authenticateToken, taskController_1.updateTask);
// DELETE /api/tasks/:id
router.delete('/:id', auth_1.authenticateToken, taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map