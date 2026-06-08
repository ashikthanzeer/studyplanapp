"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subjectController_1 = require("../controllers/subjectController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/subjects
router.get('/', auth_1.authenticateToken, subjectController_1.getSubjects);
// POST /api/subjects
router.post('/', auth_1.authenticateToken, subjectController_1.createSubject);
// PUT /api/subjects/:id
router.put('/:id', auth_1.authenticateToken, subjectController_1.updateSubject);
// DELETE /api/subjects/:id
router.delete('/:id', auth_1.authenticateToken, subjectController_1.deleteSubject);
exports.default = router;
//# sourceMappingURL=subjects.js.map