import { Router, Request, Response, NextFunction } from 'express';
import { getSourceDirectory, getCategory, searchSources } from '../lib/source-directory';
import { redisClient } from '../config/redis';

const router = Router();

const DIRECTORY_CACHE_KEY = 'sources:directory';
const CACHE_TTL_SECONDS = 3600;

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string)?.trim();

    if (q) {
      const cacheKey = `sources:search:${q.toLowerCase()}`;
      if (redisClient.isReady) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json({ query: q, ...JSON.parse(cached) });
        }
      }
      const result = { categories: searchSources(q) };
      if (redisClient.isReady) {
        await redisClient.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
      }
      return res.json({ query: q, ...result });
    }

    if (redisClient.isReady) {
      const cached = await redisClient.get(DIRECTORY_CACHE_KEY);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const full = getSourceDirectory();
    if (redisClient.isReady) {
      await redisClient.setEx(DIRECTORY_CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(full));
    }
    res.json(full);
  } catch (error) {
    next(error);
  }
});

router.get('/categories/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const category = getCategory(id);
    if (!category) {
      return res.status(404).json({ error: `Category '${id}' not found` });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
});

export default router;