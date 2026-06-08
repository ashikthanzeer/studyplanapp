"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjects = getSubjects;
exports.createSubject = createSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
const connection_1 = require("../db/connection");
async function getSubjects(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await (0, connection_1.query)('SELECT id, name, color FROM subjects WHERE user_id = $1 ORDER BY name', [req.user.id]);
        res.json({ subjects: result.rows });
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
}
async function createSubject(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, color } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }
        const result = await (0, connection_1.query)('INSERT INTO subjects (user_id, name, color) VALUES ($1, $2, $3) RETURNING id, name, color', [req.user.id, name, color || '#3b82f6']);
        res.status(201).json({ message: 'Subject created', subject: result.rows[0] });
    }
    catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Subject already exists' });
        }
        console.error('Error creating subject:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
}
async function updateSubject(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const { name, color } = req.body;
        const result = await (0, connection_1.query)(`UPDATE subjects SET name = COALESCE($1, name), color = COALESCE($2, color)
       WHERE id = $3 AND user_id = $4 RETURNING id, name, color`, [name, color, id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json({ message: 'Subject updated', subject: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: 'Failed to update subject' });
    }
}
async function deleteSubject(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const result = await (0, connection_1.query)('DELETE FROM subjects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json({ message: 'Subject deleted' });
    }
    catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
}
//# sourceMappingURL=subjectController.js.map