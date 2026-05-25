import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/tasks
router.get('/', authenticateToken, getTasks);

// POST /api/tasks
router.post('/', authenticateToken, createTask);

// GET /api/tasks/:id
router.get('/:id', authenticateToken, getTaskById);

// PUT /api/tasks/:id
router.put('/:id', authenticateToken, updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, deleteTask);

export default router;
