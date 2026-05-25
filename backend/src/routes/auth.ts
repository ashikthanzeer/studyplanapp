import { Router } from 'express';
import { register, login, getUserProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getUserProfile);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// POST /api/auth/refresh-token
router.post('/refresh-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token refresh endpoint' });
});

export default router;
