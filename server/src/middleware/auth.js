const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const signAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });

const setAuthCookies = (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
  return { accessToken, refreshToken };
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, maxAge: 0 });
};

const requireAuth = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    // ignore invalid token
  }
  next();
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
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

module.exports = {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  requireAuth,
  optionalAuth,
  refreshAccessToken,
  JWT_SECRET,
  JWT_EXPIRES,
  REFRESH_EXPIRES,
};