import { Router } from 'express';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/subjects
router.get('/', authenticateToken, getSubjects);

// POST /api/subjects
router.post('/', authenticateToken, createSubject);

// PUT /api/subjects/:id
router.put('/:id', authenticateToken, updateSubject);

// DELETE /api/subjects/:id
router.delete('/:id', authenticateToken, deleteSubject);

export default router;
