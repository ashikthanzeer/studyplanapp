import { Response } from 'express';
import { query, getClient } from '../db/connection';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  isValidEmail,
} from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/errorHandler';

export async function register(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Acquire a client from pool to run transaction
    const dbClient = await getClient();
    try {
      await dbClient.query('BEGIN');

      // Create user
      const result = await dbClient.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, passwordHash]
      );
      const user = result.rows[0];

      // Create student profile
      await dbClient.query(
        'INSERT INTO student_profiles (user_id, name) VALUES ($1, $2)',
        [user.id, email.split('@')[0]]
      );

      // Create user preferences
      await dbClient.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [user.id]
      );

      // Create default Kanban Columns (To Do, In Progress, Done)
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await dbClient.query(
          'INSERT INTO kanban_columns (user_id, name, position) VALUES ($1, $2, $3)',
          [user.id, defaultColumns[i], i + 1]
        );
      }

      await dbClient.query('COMMIT');

      const token = generateToken(user.id, user.email);

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (dbError) {
      await dbClient.query('ROLLBACK');
      throw dbError;
    } finally {
      dbClient.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePasswords(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getUserProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      `SELECT u.id, u.email, sp.name, sp.avatar_url, sp.bio
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}
