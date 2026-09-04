import { Router, Request, Response, NextFunction } from 'express';
import { allSources } from '../lib/all-sources';

const router = Router();

// Search ALL sources from one endpoint
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Search all sources
    const results = await allSources.search(q, limit);
    
    res.json({
      query: q,
      total: results.length,
      results,
      sources: [
        'openlibrary', 'gutenberg', 'internet_archive', 
        'digital_library_india', 'perseus', 'hathitrust',
        'europeana', 'manybooks', 'openstax', 'libretexts',
        'doab', 'scielo'
      ]
    });
  } catch (error) {
    console.error('Multi-source search error:', error);
    next(error);
  }
});

// Search specific source
router.get('/:source', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = String(req.params.source);
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const sourceMap: Record<string, () => Promise<any[]>> = {
      openlibrary: () => allSources.searchOpenLibrary(q),
      gutenberg: () => allSources.searchGutenberg(q),
      internet_archive: () => allSources.searchInternetArchive(q),
      digital_library_india: () => allSources.searchDLI(q),
      perseus: () => allSources.searchPerseus(q),
      hathitrust: () => allSources.searchHathiTrust(q),
      europeana: () => allSources.searchEuropeana(q),
      manybooks: () => allSources.searchManyBooks(q),
      openstax: () => allSources.searchOpenStax(q),
      libretexts: () => allSources.searchLibreTexts(q),
      doab: () => allSources.searchDOAB(q),
      scielo: () => allSources.searchSciELO(q),
    };
    
    if (!sourceMap[source]) {
      return res.status(404).json({ 
        error: `Source '${source}' not found`,
        available: Object.keys(sourceMap)
      });
    }
    
    const results = await sourceMap[source]();
    results.forEach((r: any) => r.source = source);
    
    res.json({
      query: q,
      source,
      results: results.slice(0, limit)
    });
  } catch (error) {
    console.error(`Source-specific search error for ${req.params.source}:`, error);
    next(error);
  }
});

export default router;