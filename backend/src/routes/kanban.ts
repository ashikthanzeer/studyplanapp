import { Router } from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  moveTaskToColumn,
  getColumnTasks,
} from '../controllers/kanbanController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/kanban/columns
router.get('/columns', authenticateToken, getColumns);

// POST /api/kanban/columns
router.post('/columns', authenticateToken, createColumn);

// PUT /api/kanban/columns/:id
router.put('/columns/:id', authenticateToken, updateColumn);

// DELETE /api/kanban/columns/:id
router.delete('/columns/:id', authenticateToken, deleteColumn);

// POST /api/kanban/move-task
router.post('/move-task', authenticateToken, moveTaskToColumn);

// GET /api/kanban/columns/:columnId/tasks
router.get('/columns/:columnId/tasks', authenticateToken, getColumnTasks);

export default router;
