import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { 
  signAccessToken, 
  setAuthCookies, 
  clearAuthCookies, 
  requireAuth, 
  refreshAccessToken,
  AuthenticatedRequest
} from '../middleware/auth';
import { validateBody, registerSchema, loginSchema } from '../middleware/validate';

const router = Router();

const validatePassword = (password: string): string | null => {
  if (String(password).length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

router.post('/register', validateBody(registerSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const { rows } = await db.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, plan, created_at`,
      [normalizedEmail, String(name).trim(), passwordHash]
    );

    const user = rows[0];
    setAuthCookies(res, user);
    return res.status(201).json({ user });
  } catch (error) {
    console.error('Register error:', (error as Error).message);
    return next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await db.query(
      'SELECT id, email, name, plan, password_hash, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(String(password), rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash, ...user } = rows[0];
    setAuthCookies(res, user);
    return res.json({ user });
  } catch (error) {
    console.error('Login error:', (error as Error).message);
    return next(error);
  }
});

router.post('/refresh', refreshAccessToken);

router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  clearAuthCookies(res);
  return res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, name, plan, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Me error:', (error as Error).message);
    return next(error);
  }
});

export default router;