const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');
const gutenberg = require('../lib/gutenberg');
const {
  mapOpenLibraryDoc,
  mapGutenbergDoc,
  upsertOpenLibraryBooks,
  upsertGutenbergBooks,
  rowToBook,
} = require('../lib/books');

const OL_SEARCH_URL = 'https://openlibrary.org/search.json';

async function searchLocalBooks(q) {
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

async function fetchFromOpenLibrary(q) {
  const url = `${OL_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i,isbn,ebook_access,ia`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`OpenLibrary API responded with status: ${response.status}`);
  }
  const data = await response.json();
  return (data.docs || []).map(mapOpenLibraryDoc).filter((book) => book !== null);
}

async function fetchFromGutenberg(q) {
  const docs = await gutenberg.search(q);
  return docs
    .filter((doc) => doc.media_type === 'Text')
    .map(mapGutenbergDoc);
}

router.get('/', async (req, res, next) => {
  try {
    let q = (req.query.q || '').trim().slice(0, 200);

    if (!q) {
      return res.json([]);
    }

    const cacheKey = `search:all:${q.toLowerCase()}`;

    // 1. Attempt cache retrieval
    if (redisClient.isReady) {
      const cachedResults = await redisClient.get(cacheKey);
      if (cachedResults) {
        console.log(`Cache hit for query: ${q}`);
        return res.json(JSON.parse(cachedResults));
      }
    }

    console.log(`Cache miss for query: ${q}. Fetching from Open Library + Gutenberg...`);

    let books = [];

    try {
      // 2. Query both public library sources in parallel (one failing must not lose the other)
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

      // 3. Persist to PostgreSQL in the background (failures are logged, never block the response)
      const olBooks = books.filter((b) => b.source === 'openlibrary');
      const gutBooks = books.filter((b) => b.source === 'gutenberg');
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
      console.error('Upstream fetch failed, falling back to local data:', err.message);
      // 3b. Fallback: serve locally indexed books if upstream APIs are unreachable
      books = await searchLocalBooks(q).catch((dbErr) => {
        console.error('Local DB fallback search failed:', dbErr.message);
        return [];
      });
    }

    // 4. Cache the results for 1 hour to prevent API throttling
    if (redisClient.isReady && books.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(books));
    }

    res.json(books);
  } catch (error) {
    console.error('Search API Error:', error);
    next(error);
  }
});

module.exports = router;
