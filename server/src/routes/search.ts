import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { redisClient, connectRedis } from '../config/redis';
import { gutenberg } from '../lib/gutenberg';
import {
  mapOpenLibraryDoc,
  mapGutenbergDoc,
  upsertOpenLibraryBooks,
  upsertGutenbergBooks,
  rowToBook,
} from '../lib/books';
import { validate, searchQuerySchema } from '../middleware/validate';

const router = Router();
const OL_SEARCH_URL = 'https://openlibrary.org/search.json';

async function searchLocalBooks(q: string) {
  const { rows } = await db.query(
    `SELECT isbn_13, gutenberg_id, archive_id, title, authors, published_year, cover_url, source
       FROM books
      WHERE title ILIKE $1 OR $2 = ANY(authors) OR isbn_13 LIKE $3 OR gutenberg_id::text = $2
      ORDER BY title
      LIMIT 25`,
    [`%${q}%`, q, `%${q}%`]
  );
  return rows.map(rowToBook);
}

async function fetchFromOpenLibrary(q: string) {
  const url = `${OL_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i,isbn,ebook_access,ia`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`OpenLibrary API responded with status: ${response.status}`);
  }
  const data: any = await response.json();
  const docs: any[] = data.docs || [];
  return docs.map(mapOpenLibraryDoc).filter((book) => book !== null);
}

async function fetchFromGutenberg(q: string) {
  const docs: any[] = await gutenberg.search(q);
  return docs
    .filter((doc: any) => doc.media_type === 'Text')
    .map(mapGutenbergDoc);
}

router.get('/', validate(searchQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;

    const cacheKey = `search:all:${q.toLowerCase()}`;

    await connectRedis();
    if (redisClient.isReady) {
      const cachedResults = await redisClient.get(cacheKey);
      if (cachedResults) {
        console.log(`Cache hit for query: ${q}`);
        return res.json(JSON.parse(cachedResults));
      }
    }

    console.log(`Cache miss for query: ${q}. Fetching from Open Library + Gutenberg...`);

    let books: Array<ReturnType<typeof mapOpenLibraryDoc> | ReturnType<typeof mapGutenbergDoc>> = [];

    try {
      const [openLibraryResult, gutenbergResult] = await Promise.allSettled([
        fetchFromOpenLibrary(q),
        fetchFromGutenberg(q),
      ]);

      if (openLibraryResult.status === 'rejected') {
        console.error('Open Library search failed:', openLibraryResult.reason.message);
      }
      if (gutenbergResult.status === 'rejected') {
        console.error('Gutenberg search failed:', gutenbergResult.reason.message);
      }

      books = [
        ...(openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : []),
        ...(gutenbergResult.status === 'fulfilled' ? gutenbergResult.value : []),
      ].slice(0, 30);

      const olBooks = books.filter((b) => b?.source === 'openlibrary');
      const gutBooks = books.filter((b) => b?.source === 'gutenberg');
      Promise.allSettled([
        upsertOpenLibraryBooks(olBooks),
        upsertGutenbergBooks(gutBooks),
      ]).then((results) => {
        results.forEach((result, i) => {
          if (result.status === 'rejected') {
            console.error(`Failed to upsert ${i === 0 ? 'openlibrary' : 'gutenberg'} books for "${q}":`, result.reason.message);
          }
        });
      });
    } catch (err) {
      console.error('Upstream fetch failed, falling back to local data:', (err as Error).message);
      books = await searchLocalBooks(q).catch((dbErr) => {
        console.error('Local DB fallback search failed:', (dbErr as Error).message);
        return [];
      });
    }

    await connectRedis();
    if (redisClient.isReady && books.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(books));
    }

    res.json(books);
  } catch (error) {
    console.error('Search API Error:', error);
    next(error);
  }
});

export default router;