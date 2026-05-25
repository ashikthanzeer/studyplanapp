"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPomodoroSession = createPomodoroSession;
exports.completePomodoroSession = completePomodoroSession;
exports.abandonPomodoroSession = abandonPomodoroSession;
exports.getSessionHistory = getSessionHistory;
exports.getSessionStats = getSessionStats;
exports.exportSessionData = exportSessionData;
const connection_1 = require("../db/connection");
async function createPomodoroSession(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { task_id, duration_minutes, break_duration_minutes } = req.body;
        const result = await (0, connection_1.query)(`INSERT INTO pomodoro_sessions
       (user_id, task_id, duration_minutes, break_duration_minutes, started_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, task_id, duration_minutes, break_duration_minutes, started_at`, [
            req.user.id,
            task_id || null,
            duration_minutes || 25,
            break_duration_minutes || 5,
        ]);
        res.status(201).json({ message: 'Session started', session: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
}
async function completePomodoroSession(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const result = await (0, connection_1.query)(`UPDATE pomodoro_sessions SET
        status = 'completed', ended_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ message: 'Session completed', session: result.rows[0] });
    }
    catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({ error: 'Failed to complete session' });
    }
}
async function abandonPomodoroSession(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const result = await (0, connection_1.query)(`UPDATE pomodoro_sessions SET
        status = 'abandoned', ended_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ message: 'Session abandoned', session: result.rows[0] });
    }
    catch (error) {
        console.error('Error abandoning session:', error);
        res.status(500).json({ error: 'Failed to abandon session' });
    }
}
async function getSessionHistory(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { task_id, date_from, date_to } = req.query;
        let sql = 'SELECT * FROM pomodoro_sessions WHERE user_id = $1';
        const params = [req.user.id];
        if (task_id) {
            params.push(task_id);
            sql += ` AND task_id = $${params.length}`;
        }
        if (date_from) {
            params.push(date_from);
            sql += ` AND DATE(started_at) >= $${params.length}`;
        }
        if (date_to) {
            params.push(date_to);
            sql += ` AND DATE(started_at) <= $${params.length}`;
        }
        sql += ' ORDER BY started_at DESC';
        const result = await (0, connection_1.query)(sql, params);
        res.json({ sessions: result.rows });
    }
    catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
}
async function getSessionStats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { date_from, date_to } = req.query;
        let sqlTotalTime = `SELECT SUM(duration_minutes) as total_minutes, COUNT(*) as session_count
       FROM pomodoro_sessions
       WHERE user_id = $1 AND status = 'completed'`;
        const params = [req.user.id];
        if (date_from) {
            params.push(date_from);
            sqlTotalTime += ` AND DATE(started_at) >= $${params.length}`;
        }
        if (date_to) {
            params.push(date_to);
            sqlTotalTime += ` AND DATE(started_at) <= $${params.length}`;
        }
        const statsResult = await (0, connection_1.query)(sqlTotalTime, params);
        const stats = statsResult.rows[0];
        // Get time per task
        const sqlPerTask = `
      SELECT t.id, t.title, SUM(ps.duration_minutes) as minutes_spent, COUNT(ps.id) as session_count
      FROM pomodoro_sessions ps
      LEFT JOIN tasks t ON ps.task_id = t.id
      WHERE ps.user_id = $1 AND ps.status = 'completed'
      GROUP BY t.id, t.title
      ORDER BY minutes_spent DESC
    `;
        const perTaskResult = await (0, connection_1.query)(sqlPerTask, [req.user.id]);
        res.json({
            stats: {
                total_minutes: parseInt(stats.total_minutes) || 0,
                session_count: stats.session_count || 0,
                average_session_duration: stats.session_count ? Math.round(parseInt(stats.total_minutes) / stats.session_count) : 0,
                by_task: perTaskResult.rows,
            },
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}
async function exportSessionData(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await (0, connection_1.query)(`SELECT ps.id, ps.task_id, t.title as task_title, ps.duration_minutes,
              ps.status, ps.started_at, ps.ended_at
       FROM pomodoro_sessions ps
       LEFT JOIN tasks t ON ps.task_id = t.id
       WHERE ps.user_id = $1
       ORDER BY ps.started_at DESC`, [req.user.id]);
        // Convert to CSV
        const headers = ['ID', 'Task ID', 'Task Title', 'Duration (min)', 'Status', 'Started At', 'Ended At'];
        const rows = result.rows.map((row) => [
            row.id,
            row.task_id || '',
            row.task_title || 'Unassigned',
            row.duration_minutes,
            row.status,
            row.started_at,
            row.ended_at || '',
        ]);
        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="pomodoro_sessions.csv"');
        res.send(csv);
    }
    catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
}
//# sourceMappingURL=pomodoroController.js.map