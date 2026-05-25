import { Router } from 'express';
import {
  createPomodoroSession,
  completePomodoroSession,
  abandonPomodoroSession,
  getSessionHistory,
  getSessionStats,
  exportSessionData,
} from '../controllers/pomodoroController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/pomodoro/start
router.post('/start', authenticateToken, createPomodoroSession);

// PUT /api/pomodoro/:id/complete
router.put('/:id/complete', authenticateToken, completePomodoroSession);

// PUT /api/pomodoro/:id/abandon
router.put('/:id/abandon', authenticateToken, abandonPomodoroSession);

// GET /api/pomodoro/history
router.get('/history', authenticateToken, getSessionHistory);

// GET /api/pomodoro/stats
router.get('/stats', authenticateToken, getSessionStats);

// GET /api/pomodoro/export
router.get('/export', authenticateToken, exportSessionData);

export default router;
