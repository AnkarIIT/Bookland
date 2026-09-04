import { Router, Request, Response, NextFunction } from 'express';
import { papers } from '../lib/papers';
import { redisClient } from '../config/redis';

const router = Router();

// Search papers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as 'all' | 'arxiv' | 'crossref') || 'all';
    
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Check cache
    const cacheKey = `papers:\${type}:\${query.toLowerCase()}`;
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    
    // Search
    const results = await papers.search(query, type);
    
    // Cache for 1 hour
    if (redisClient.isReady && results.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(results));
    }
    
    res.json(results);
  } catch (error) {
    console.error('Paper search error:', error);
    next(error);
  }
});

// Get specific paper
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    
    const paper = await papers.getById(id);
    
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    res.json(paper);
  } catch (error) {
    console.error('Paper fetch error:', error);
    next(error);
  }
});

export default router;
