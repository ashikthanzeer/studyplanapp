"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.createTask = createTask;
exports.getTaskById = getTaskById;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const connection_1 = require("../db/connection");
async function getTasks(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { subject_id, priority, status, search } = req.query;
        let sql = `SELECT t.*, s.name as subject_name FROM tasks t
       LEFT JOIN subjects s ON t.subject_id = s.id
       WHERE t.user_id = $1 AND t.deleted_at IS NULL`;
        const params = [req.user.id];
        if (subject_id) {
            params.push(subject_id);
            sql += ` AND t.subject_id = $${params.length}`;
        }
        if (priority) {
            params.push(priority);
            sql += ` AND t.priority = $${params.length}`;
        }
        if (status) {
            params.push(status);
            sql += ` AND t.status = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
            params.push(`%${search}%`);
            sql += ` OR t.description ILIKE $${params.length}`;
        }
        sql += ' ORDER BY t.due_date ASC, t.created_at DESC';
        const result = await (0, connection_1.query)(sql, params);
        res.json({ tasks: result.rows });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
}
async function createTask(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { title, description, due_date, priority, subject_id } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Task title is required' });
        }
        const result = await (0, connection_1.query)(`INSERT INTO tasks (user_id, title, description, due_date, priority, subject_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'to_do')
       RETURNING id, title, description, due_date, priority, status, subject_id`, [req.user.id, title, description, due_date, priority || 'medium', subject_id || null]);
        res.status(201).json({ message: 'Task created', task: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
}
async function getTaskById(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const result = await (0, connection_1.query)(`SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ task: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
}
async function updateTask(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const { title, description, due_date, priority, status, subject_id } = req.body;
        const result = await (0, connection_1.query)(`UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        due_date = COALESCE($3, due_date),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        subject_id = COALESCE($6, subject_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 AND deleted_at IS NULL
       RETURNING *`, [title, description, due_date, priority, status, subject_id, id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated', task: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
}
async function deleteTask(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        // Soft delete
        const result = await (0, connection_1.query)(`UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
}
//# sourceMappingURL=taskController.js.map