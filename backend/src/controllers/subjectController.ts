import { Response } from 'express';
import { query } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/errorHandler';

export async function getSubjects(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      "SELECT id, name, color FROM subjects WHERE user_id = $1 ORDER BY (name = 'General') DESC, name ASC",
      [req.user.id]
    );

    res.json({ subjects: result.rows });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}

export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const result = await query(
      'INSERT INTO subjects (user_id, name, color) VALUES ($1, $2, $3) RETURNING id, name, color',
      [req.user.id, name, color || '#3b82f6']
    );

    res.status(201).json({ message: 'Subject created', subject: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Subject already exists' });
    }
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
}

export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { name, color } = req.body;

    const result = await query(
      `UPDATE subjects SET name = COALESCE($1, name), color = COALESCE($2, color)
       WHERE id = $3 AND user_id = $4 RETURNING id, name, color`,
      [name, color, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject updated', subject: result.rows[0] });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
}

export async function deleteSubject(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check subject exists and is not 'General'
    const subjectCheck = await query(
      'SELECT name FROM subjects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    if (subjectCheck.rows[0].name === 'General') {
      return res.status(400).json({ error: 'The "General" subject cannot be deleted.' });
    }

    // Get the user's "General" subject to reassign orphaned tasks
    const generalRes = await query(
      "SELECT id FROM subjects WHERE user_id = $1 AND name = 'General'",
      [req.user.id]
    );
    const generalId = generalRes.rows.length > 0 ? generalRes.rows[0].id : null;

    // Reassign tasks from the deleted subject to "General"
    await query(
      'UPDATE tasks SET subject_id = $1, updated_at = CURRENT_TIMESTAMP WHERE subject_id = $2 AND user_id = $3 AND deleted_at IS NULL',
      [generalId, id, req.user.id]
    );

    // Now safe to delete
    await query(
      'DELETE FROM subjects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
}
