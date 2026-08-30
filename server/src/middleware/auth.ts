import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const signAccessToken = (user: { id: string; email: string }) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const signRefreshToken = (user: { id: string; email: string }) =>
  jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });

export const setAuthCookies = (res: Response, user: { id: string; email: string }) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
  return { accessToken, refreshToken };
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, maxAge: 0 });
};

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return next();
  } catch (err) {
    if ((err as jwt.JsonWebTokenError).name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    // ignore invalid token
  }
  next();
};

export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string; type: string; email: string };
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    const user = { id: payload.id, email: payload.email };
    const tokens = setAuthCookies(res, user);
    return res.json({ accessToken: tokens.accessToken });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export { JWT_SECRET, JWT_EXPIRES, REFRESH_EXPIRES };