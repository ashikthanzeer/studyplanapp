import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
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

export default router;
