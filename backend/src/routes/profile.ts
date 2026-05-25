import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getGamification,
  getGoals,
  updateGoals,
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authenticateToken, getProfile);

// PUT /api/profile
router.put('/', authenticateToken, updateProfile);

// GET /api/profile/preferences
router.get('/preferences', authenticateToken, getPreferences);

// PUT /api/profile/preferences
router.put('/preferences', authenticateToken, updatePreferences);

// GET /api/profile/gamification
router.get('/gamification', authenticateToken, getGamification);

// GET /api/profile/goals
router.get('/goals', authenticateToken, getGoals);

// PUT /api/profile/goals
router.put('/goals', authenticateToken, updateGoals);

export default router;
