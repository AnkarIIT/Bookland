import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { redisClient, connectRedis } from '../config/redis';
import { papers } from '../lib/papers';
import { ancientScripts } from '../lib/scripts';

const router = Router();

// Unified search across Books, Papers, and Scripts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) || '';
    const type = (req.query.type as 'all' | 'books' | 'papers' | 'scripts') || 'all';
    const limit = parseInt(req.query.limit as string) || 30;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const cacheKey = `unified:${type}:${q.toLowerCase()}:${limit}`;
    
    await connectRedis();
    if (redisClient.isReady) {
      const cachedResults = await redisClient.get(cacheKey);
      if (cachedResults) {
        return res.json(JSON.parse(cachedResults));
      }
    }
    
    const results: any[] = [];
    
    if (type === 'all' || type === 'books') {
      try {
        const books = await searchBooks(q, Math.ceil(limit / 3));
        books.forEach(b => b._source = 'book');
        results.push(...books);
      } catch (e) {
        console.error('Book search error:', e);
      }
    }
    
    if (type === 'all' || type === 'papers') {
      try {
        const paperResults = await papers.search(q, 'all', Math.ceil(limit / 3));
        paperResults.forEach(p => p._source = 'paper');
        results.push(...paperResults);
      } catch (e) {
        console.error('Paper search error:', e);
      }
    }
    
    if (type === 'all' || type === 'scripts') {
      try {
        const scriptResults = await ancientScripts.search(q, 'all', Math.ceil(limit / 3));
        scriptResults.forEach(s => s._source = 'script');
        results.push(...scriptResults);
      } catch (e) {
        console.error('Script search error:', e);
      }
    }
    
    const limited = results.slice(0, limit);
    
    if (redisClient.isReady && limited.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(limited));
    }
    
    res.json({
      query: q,
      type,
      total: results.length,
      returned: limited.length,
      results: limited,
    });
  } catch (error) {
    console.error('Unified search error:', error);
    next(error);
  }
});

// Helper: Search books from OpenLibrary and Gutenberg
async function searchBooks(q: string, limit = 10) {
  const OL_SEARCH_URL = 'https://openlibrary.org/search.json';
  const books: any[] = [];
  
  // OpenLibrary search
  try {
    const olResponse = await fetch(
      `${OL_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,ebook_access,ia`
    );
    if (olResponse.ok) {
      const olData = await olResponse.json() as any;
      for (const doc of olData.docs || []) {
        books.push({
          id: `ol-${doc.key?.replace('/works/', '')}`,
          title: doc.title,
          authors: doc.author_name || [],
          published_year: doc.first_publish_year,
          cover_url: doc.cover_i ? `https://covers.openlibrary.org/w/id/${doc.cover_i}-L` : null,
          isbn_13: doc.isbn?.find((i: string) => i.length === 13),
          source: 'openlibrary',
          readable: doc.ebook_access?.includes('borrowable') || doc.ebook_access?.includes('public'),
        });
      }
    }
  } catch (e) {
    console.error('OpenLibrary error:', e);
  }
  
  // Gutenberg search (using their API)
  try {
    const gbResponse = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(q)}&page=1`);
    if (gbResponse.ok) {
      const gbData = await gbResponse.json() as any;
      for (const book of gbData.results || []) {
        books.push({
          id: `gutenberg-${book.id}`,
          title: book.title,
          authors: book.authors?.map((a: any) => a.name) || [],
          published_year: book.release_date ? parseInt(book.release_date.split('-')[0]) : null,
          cover_url: book.imagery?.find((i: any) => i.type === 'cover')?.url || null,
          source: 'gutenberg',
          readable: true,
        });
      }
    }
  } catch (e) {
    console.error('Gutenberg error:', e);
  }
  
  return books.slice(0, limit);
}

// Search only papers
router.get('/papers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const results = await papers.search(q, 'all', limit);
    res.json(results);
  } catch (error) {
    console.error('Paper search error:', error);
    next(error);
  }
});

// Search only scripts
router.get('/scripts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    const lang = (req.query.lang as string) || null;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!q && !lang) {
      return res.status(400).json({ error: 'Search query or language required' });
    }
    
    const results = await ancientScripts.search(q || lang || '', 'all', limit);
    res.json(results);
  } catch (error) {
    console.error('Script search error:', error);
    next(error);
  }
});

export default router;