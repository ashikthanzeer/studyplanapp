import { Response } from 'express';
import { query } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/errorHandler';
import { updateStreakAndBadges } from '../services/gamificationService';

export async function createPomodoroSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { task_id, duration_minutes, break_duration_minutes } = req.body;

    const result = await query(
      `INSERT INTO pomodoro_sessions
       (user_id, task_id, duration_minutes, break_duration_minutes, started_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, task_id, duration_minutes, break_duration_minutes, started_at`,
      [
        req.user.id,
        task_id || null,
        duration_minutes || 25,
        break_duration_minutes || 5,
      ]
    );

    res.status(201).json({ message: 'Session started', session: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating session:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to start session' });
  }
}

export async function completePomodoroSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { duration_minutes } = req.body;

    // Validate session ID is numeric
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid session ID: must be a number' });
    }

    let result;
    if (typeof duration_minutes === 'number') {
      result = await query(
        `UPDATE pomodoro_sessions SET
          status = 'completed', ended_at = CURRENT_TIMESTAMP, duration_minutes = $1
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [duration_minutes, id, req.user.id]
      );
    } else {
      result = await query(
        `UPDATE pomodoro_sessions SET
          status = 'completed', ended_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Evaluate and update streaks and badges
    updateStreakAndBadges(req.user.id).catch((err) => {
      console.error('Error triggering streak/badge update:', err);
    });

    res.json({ message: 'Session completed', session: result.rows[0] });
  } catch (error: any) {
    console.error('Error completing session:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      sessionId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to complete session' });
  }
}

export async function abandonPomodoroSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Validate session ID is numeric
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid session ID: must be a number' });
    }

    const result = await query(
      `UPDATE pomodoro_sessions SET
        status = 'abandoned', ended_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session abandoned', session: result.rows[0] });
  } catch (error: any) {
    console.error('Error abandoning session:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      sessionId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to abandon session' });
  }
}

export async function getSessionHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { task_id, date_from, date_to } = req.query;
    let sql =
      'SELECT * FROM pomodoro_sessions WHERE user_id = $1';
    const params: any[] = [req.user.id];

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

    const result = await query(sql, params);
    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

export async function getSessionStats(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { date_from, date_to } = req.query;
    let sqlTotalTime =
      `SELECT SUM(duration_minutes) as total_minutes, COUNT(*) as session_count
       FROM pomodoro_sessions
       WHERE user_id = $1 AND status = 'completed'`;
    const params: any[] = [req.user.id];

    if (date_from) {
      params.push(date_from);
      sqlTotalTime += ` AND DATE(started_at) >= $${params.length}`;
    }

    if (date_to) {
      params.push(date_to);
      sqlTotalTime += ` AND DATE(started_at) <= $${params.length}`;
    }

    const statsResult = await query(sqlTotalTime, params);
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

    const perTaskResult = await query(sqlPerTask, [req.user.id]);

    // Calculate active study streak
    const sqlDates = `
      SELECT DATE(started_at) as session_date
      FROM pomodoro_sessions
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY session_date
      ORDER BY session_date DESC
    `;
    const datesResult = await query(sqlDates, [req.user.id]);
    const dates = datesResult.rows.map((row: any) => {
      const d = new Date(row.session_date);
      return d.toISOString().split('T')[0];
    });

    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mostRecentDate = new Date(dates[0]);
      mostRecentDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - mostRecentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak = 1;
        let lastDate = mostRecentDate;
        for (let i = 1; i < dates.length; i++) {
          const checkDate = new Date(dates[i]);
          checkDate.setHours(0, 0, 0, 0);

          const stepDiff = lastDate.getTime() - checkDate.getTime();
          const stepDays = Math.floor(stepDiff / (1000 * 60 * 60 * 24));

          if (stepDays === 1) {
            currentStreak++;
            lastDate = checkDate;
          } else if (stepDays > 1) {
            break;
          }
        }
      }
    }

    // Fetch focus time for Today and Current Week, plus previous periods
    const timeRangesResult = await query(
      `SELECT 
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM pomodoro_sessions WHERE user_id = $1 AND status = 'completed' AND DATE(ended_at) = CURRENT_DATE) as today_minutes,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM pomodoro_sessions WHERE user_id = $1 AND status = 'completed' AND DATE(ended_at) = CURRENT_DATE - INTERVAL '1 day') as previous_day_minutes,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM pomodoro_sessions WHERE user_id = $1 AND status = 'completed' AND ended_at >= DATE_TRUNC('week', CURRENT_DATE)) as week_minutes,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM pomodoro_sessions WHERE user_id = $1 AND status = 'completed' AND ended_at >= (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week') AND ended_at < DATE_TRUNC('week', CURRENT_DATE)) as previous_week_minutes`,
      [req.user.id]
    );

    const todayMinutes = parseInt(timeRangesResult.rows[0].today_minutes) || 0;
    const previousDayMinutes = parseInt(timeRangesResult.rows[0].previous_day_minutes) || 0;
    const weekMinutes = parseInt(timeRangesResult.rows[0].week_minutes) || 0;
    const previousWeekMinutes = parseInt(timeRangesResult.rows[0].previous_week_minutes) || 0;

    const todayHours = parseFloat((todayMinutes / 60).toFixed(1));
    const previousDayHours = parseFloat((previousDayMinutes / 60).toFixed(1));
    const weekHours = parseFloat((weekMinutes / 60).toFixed(1));
    const previousWeekHours = parseFloat((previousWeekMinutes / 60).toFixed(1));

    res.json({
      stats: {
        total_minutes: parseInt(stats.total_minutes) || 0,
        session_count: stats.session_count || 0,
        average_session_duration: stats.session_count ? Math.round(parseInt(stats.total_minutes) / stats.session_count) : 0,
        streak: currentStreak,
        by_task: perTaskResult.rows,
        today_hours: todayHours,
        previous_day_hours: previousDayHours,
        week_hours: weekHours,
        previous_week_hours: previousWeekHours,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function exportSessionData(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      `SELECT ps.id, ps.task_id, t.title as task_title, ps.duration_minutes,
              ps.status, ps.started_at, ps.ended_at
       FROM pomodoro_sessions ps
       LEFT JOIN tasks t ON ps.task_id = t.id
       WHERE ps.user_id = $1
       ORDER BY ps.started_at DESC`,
      [req.user.id]
    );

    // Convert to CSV
    const headers = ['ID', 'Task ID', 'Task Title', 'Duration (min)', 'Status', 'Started At', 'Ended At'];
    const rows = result.rows.map((row: any) => [
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
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}
