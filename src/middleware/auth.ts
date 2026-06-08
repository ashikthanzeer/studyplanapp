import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from './errorHandler';
import { query } from '../db/connection';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; email: string };
    req.user = decoded;

    // Allow email verification, resend, logout, and getting user profile info
    const path = req.baseUrl + req.path;
    const isAllowedUnverified = path.includes('/verify-email') || 
                                path.includes('/resend-verification') || 
                                path.includes('/logout') ||
                                (path === '/api/auth/profile' && req.method === 'GET');

    if (!isAllowedUnverified) {
      const userRes = await query('SELECT is_verified FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (!userRes.rows[0].is_verified) {
        return res.status(403).json({ 
          error: 'Email verification required', 
          is_verified: false 
        });
      }
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
