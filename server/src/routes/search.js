const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');

const OL_SEARCH_URL = 'https://openlibrary.org/search.json';

async function searchLocalBooks(q) {
  const { rows } = await db.query(
    `SELECT isbn_13, title, authors, published_year, cover_url
       FROM books
      WHERE title ILIKE $1 OR $2 = ANY(authors) OR isbn_13 LIKE $3
      ORDER BY title
      LIMIT 25`,
    [`%${q}%`, q, `%${q}%`]
  );
  return rows.map((row) => ({
    isbn_13: row.isbn_13,
    title: row.title,
    authors: row.authors || [],
    published_year: row.published_year,
    cover_url: row.cover_url,
    source: 'local',
  }));
}

function mapOpenLibraryDoc(doc) {
  const isbnList = doc.isbn || [];
  const isbn13 = isbnList.find(
    (i) => typeof i === 'string' && /^\d{13}$/.test(i)
  ) || isbnList.find((i) => typeof i === 'string' && i.replace(/\D/g, '').length === 13);

  if (!isbn13) return null;

  const cleanIsbn = isbn13.replace(/\D/g, '');
  return {
    isbn_13: cleanIsbn,
    title: doc.title || 'Unknown Title',
    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
    published_year: doc.first_publish_year || null,
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`
      : null,
  };
}

async function fetchFromOpenLibrary(q) {
  const url = `${OL_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i,isbn`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`OpenLibrary API responded with status: ${response.status}`);
  }
  const data = await response.json();
  return (data.docs || [])
    .map(mapOpenLibraryDoc)
    .filter((book) => book !== null);
}

// Single batched upsert instead of N fire-and-forget queries
async function upsertBooks(books) {
  if (books.length === 0) return;
  await db.query(
    `INSERT INTO books (isbn_13, title, authors, published_year, cover_url, source)
     SELECT
       u.isbn_13,
       u.title,
       jsonb_array_to_text_array(u.authors),
       u.published_year,
       u.cover_url,
       u.source
     FROM UNNEST($1::text[], $2::text[], $3::jsonb[], $4::int[], $5::text[], $6::text[])
       AS u(isbn_13, title, authors, published_year, cover_url, source)
     ON CONFLICT (isbn_13) DO UPDATE SET
       title = EXCLUDED.title,
       authors = EXCLUDED.authors,
       published_year = EXCLUDED.published_year,
       cover_url = COALESCE(books.cover_url, EXCLUDED.cover_url),
       updated_at = CURRENT_TIMESTAMP`,
    [
      books.map((b) => b.isbn_13),
      books.map((b) => b.title),
      books.map((b) => JSON.stringify(b.authors)),
      books.map((b) => b.published_year),
      books.map((b) => b.cover_url),
      books.map(() => 'openlibrary'),
    ]
  );
}

router.get('/', async (req, res, next) => {
  try {
    let q = (req.query.q || '').trim().slice(0, 200);

    if (!q) {
      return res.json([]);
    }

    const cacheKey = `search:ol:${q.toLowerCase()}`;

    // 1. Attempt cache retrieval
    if (redisClient.isReady) {
      const cachedResults = await redisClient.get(cacheKey);
      if (cachedResults) {
        console.log(`Cache hit for query: ${q}`);
        return res.json(JSON.parse(cachedResults));
      }
    }

    console.log(`Cache miss for query: ${q}. Fetching from Open Library...`);

    let books;
    try {
      // 2. Fetch from Open Library API
      books = await fetchFromOpenLibrary(q);

      // 3. Persist to PostgreSQL in the background (failures are logged, never block the response)
      if (books.length > 0) {
        upsertBooks(books).catch((err) => {
          console.error(`Failed to upsert ${books.length} books for "${q}":`, err.message);
        });
      }
    } catch (err) {
      console.error('Open Library fetch failed, falling back to local data:', err.message);
      // 3b. Fallback: serve locally indexed books if the upstream API is unreachable
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
