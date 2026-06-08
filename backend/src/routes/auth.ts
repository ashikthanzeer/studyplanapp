import { Router } from 'express';
import {
  register,
  login,
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordChange,
  confirmPasswordChange,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getUserProfile);

// POST /api/auth/verify-email
router.post('/verify-email', authenticateToken, verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', authenticateToken, resendVerificationEmail);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/change-email/request
router.post('/change-email/request', authenticateToken, requestEmailChange);

// POST /api/auth/change-email/confirm
router.post('/change-email/confirm', authenticateToken, confirmEmailChange);

// POST /api/auth/change-password/request
router.post('/change-password/request', authenticateToken, requestPasswordChange);

// POST /api/auth/change-password/confirm
router.post('/change-password/confirm', authenticateToken, confirmPasswordChange);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// POST /api/auth/refresh-token
router.post('/refresh-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token refresh endpoint' });
});

export default router;
