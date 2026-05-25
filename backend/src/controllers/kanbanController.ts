import { Response } from 'express';
import { query } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/errorHandler';

export async function getColumns(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      `SELECT id, name, position FROM kanban_columns
       WHERE user_id = $1 ORDER BY position ASC`,
      [req.user.id]
    );

    res.json({ columns: result.rows });
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
}

export async function createColumn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Column name is required' });
    }

    // Get max position
    const maxResult = await query(
      'SELECT MAX(position) as max_position FROM kanban_columns WHERE user_id = $1',
      [req.user.id]
    );

    const maxPosition = maxResult.rows[0]?.max_position || 0;

    const result = await query(
      `INSERT INTO kanban_columns (user_id, name, position)
       VALUES ($1, $2, $3)
       RETURNING id, name, position`,
      [req.user.id, name, maxPosition + 1]
    );

    res.status(201).json({ message: 'Column created', column: result.rows[0] });
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
}

export async function updateColumn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { name, position } = req.body;

    const result = await query(
      `UPDATE kanban_columns SET
        name = COALESCE($1, name), position = COALESCE($2, position)
       WHERE id = $3 AND user_id = $4
       RETURNING id, name, position`,
      [name, position, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.json({ message: 'Column updated', column: result.rows[0] });
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
}

export async function deleteColumn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const result = await query(
      'DELETE FROM kanban_columns WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.json({ message: 'Column deleted' });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
}

export async function moveTaskToColumn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { columnId, taskId, position } = req.body;

    // Remove task from any existing column
    await query(
      'DELETE FROM kanban_column_tasks WHERE task_id = $1',
      [taskId]
    );

    // Add task to new column
    const result = await query(
      `INSERT INTO kanban_column_tasks (column_id, task_id, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [columnId, taskId, position || 0]
    );

    res.json({ message: 'Task moved', task: result.rows[0] });
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
}

export async function getColumnTasks(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { columnId } = req.params;

    const result = await query(
      `SELECT t.* FROM tasks t
       JOIN kanban_column_tasks kct ON t.id = kct.task_id
       WHERE kct.column_id = $1
       ORDER BY kct.position ASC`,
      [columnId]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching column tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}
