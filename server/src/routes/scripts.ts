import { Router, Request, Response, NextFunction } from 'express';
import { ancientScripts } from '../lib/scripts';
import { redisClient } from '../config/redis';

const router = Router();

// Search ancient scripts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as 'all' | 'perseus' | 'dlindia' | 'gutenberg' | 'dhd') || 'all';
    const lang = (req.query.lang as string) || null;
    
    if (!query && !lang) {
      return res.status(400).json({ error: 'Search query or language required' });
    }
    
    // Check cache
    const cacheKey = `scripts:${type}:${query || lang}`;
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    
    // Search
    const results = await ancientScripts.search(query || lang || '', type as any);
    
    // Cache for 1 hour
    if (redisClient.isReady && results.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(results));
    }
    
    res.json(results);
  } catch (error) {
    console.error('Script search error:', error);
    next(error);
  }
});

// Browse by language
router.get('/language/:lang', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.params.lang;
    
    const results = await ancientScripts.browseByLanguage(lang, 50);
    res.json(results);
  } catch (error) {
    console.error('Language browse error:', error);
    next(error);
  }
});

// Get specific script
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    
    const script = await ancientScripts.getById(id);
    
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }
    
    res.json(script);
  } catch (error) {
    console.error('Script fetch error:', error);
    next(error);
  }
});

// Get available languages
router.get('/languages', async (req: Request, res: Response) => {
  res.json([
    { code: 'sanskrit', name: 'Sanskrit (Samskrita)', scripts: ['Devanagari', 'Grantha', 'Tamil', 'Malayalam', 'Telugu', 'Kannada', 'Oriya'] },
    { code: 'pali', name: 'Pali', scripts: ['Devanagari', 'Thai', 'Roman', 'Tibetan'] },
    { code: 'classical-chinese', name: 'Classical Chinese', scripts: ['Traditional', 'Simplified', 'Kanji'] },
    { code: 'arabic', name: 'Arabic', scripts: ['Arabic', 'Persian', 'Urdu'] },
    { code: 'latin', name: 'Latin', scripts: ['Classical Latin', 'Medieval Latin'] },
  ]);
});

export default router;