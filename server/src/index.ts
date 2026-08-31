import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import cookieParser from 'cookie-parser';

import searchRoutes from './routes/search';
import bookRoutes from './routes/books';
import authRoutes from './routes/auth';
import readRoutes from './routes/read';
import collectionRoutes from './routes/collections';
import historyRoutes from './routes/history';
import paperRoutes from './routes/paper';
import scriptRoutes from './routes/scripts';
import multiSourceSearchRoutes from './routes/multi-source-search';
import { connectRedis, closeRedis } from './config/redis';
import { db, closePool } from './config/db';
import { runMigrations } from './config/migrate';

const logger = pino(
  process.env.NODE_ENV === 'production'
    ? pinoPretty({ colorize: false })
    : pinoPretty({ colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' })
);

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://covers.openlibrary.org', 'https://www.gutenberg.org', 'https://arxiv.org', 'https://export.arxiv.org', 'https://api.crossref.org', 'https://archive.org', 'https://dopiahos.org', 'https://digitalpalaeography.org'],
      connectSrc: ["'self'", clientUrl],
      frameSrc: ["'self'", 'https://archive.org', 'https://www.youtube.com'],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(compression());

app.use(cors({
  origin: clientUrl.split(',').map(u => u.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many searches, please wait a moment' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }, 'HTTP Request');
  });
  next();
});

app.use('/api/search', searchLimiter, searchRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/read', readRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/papers', searchLimiter, paperRoutes);
app.use('/api/scripts', searchLimiter, scriptRoutes);
app.use('/api/all-sources', searchLimiter, multiSourceSearchRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, method: req.method, url: req.url, ip: req.ip }, 'Unhandled error');
  const status = (err as any).status || 500;
  const message = isProduction && status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

connectRedis().catch((err) => {
  logger.warn({ err }, 'Redis connection failed, continuing without cache');
});

runMigrations().finally(() => {
  const server = app.listen(port, () => {
    logger.info(`Backend service listening on port ${port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await closeRedis().catch(() => {});
      await closePool().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
});

export default app;