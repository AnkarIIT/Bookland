const express = require('express');
const router = express.Router();
const db = require('../config/db');

const OL_BOOKS_URL = 'https://openlibrary.org/api/books';

async function fetchFromOpenLibrary(isbn) {
  const url = `${OL_BOOKS_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`OpenLibrary API responded with status: ${response.status}`);
  }
  const data = await response.json();
  const record = data[`ISBN:${isbn}`];
  if (!record) return null;

  const cover = record.cover || {};
  return {
    isbn_13: isbn,
    title: record.title || 'Unknown Title',
    subtitle: record.subtitle || null,
    authors: (record.authors || []).map((a) => a.name).filter(Boolean),
    publisher: (record.publishers || [])[0]?.name || null,
    published_year: parseInt(record.publish_date, 10) || null,
    language: (record.languages || [])[0]?.name || null,
    subjects: (record.subjects || []).map((s) => s.name).filter(Boolean),
    description: typeof record.notes === 'object' ? record.notes.value || null : record.notes || null,
    page_count: record.number_of_pages || null,
    cover_url: cover.large || cover.medium || null,
  };
}

async function upsertDetail(book) {
  await db.query(
    `INSERT INTO books (isbn_13, title, subtitle, authors, publisher, published_year, language, subjects, description, page_count, cover_url, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'openlibrary')
     ON CONFLICT (isbn_13) DO UPDATE SET
       title = EXCLUDED.title,
       subtitle = EXCLUDED.subtitle,
       authors = EXCLUDED.authors,
       publisher = EXCLUDED.publisher,
       published_year = EXCLUDED.published_year,
       language = EXCLUDED.language,
       subjects = EXCLUDED.subjects,
       description = EXCLUDED.description,
       page_count = EXCLUDED.page_count,
       cover_url = COALESCE(books.cover_url, EXCLUDED.cover_url),
       updated_at = CURRENT_TIMESTAMP`,
    [
      book.isbn_13,
      book.title,
      book.subtitle,
      book.authors,
      book.publisher,
      book.published_year,
      book.language,
      book.subjects,
      book.description,
      book.page_count,
      book.cover_url,
    ]
  );
}

const DETAIL_FIELDS = `
  isbn_13, title, subtitle, authors, publisher, published_year,
  language, subjects, description, page_count, cover_url, is_free, read_url
`;

router.get('/:isbn', async (req, res, next) => {
  try {
    const isbn = (req.params.isbn || '').replace(/\D/g, '').slice(0, 13);

    if (!isbn) {
      return res.status(400).json({ error: 'A valid ISBN is required' });
    }

    // 1. Try local persistence first (a DB outage must not block upstream fallback)
    let localBook = null;
    try {
      const { rows } = await db.query(
        `SELECT ${DETAIL_FIELDS} FROM books WHERE isbn_13 = $1`,
        [isbn]
      );
      localBook = rows[0] || null;
    } catch (dbErr) {
      console.error('Local book lookup failed, falling back to Open Library:', dbErr.message);
    }

    if (localBook) {
      return res.json(localBook);
    }

    // 2. Fetch from Open Library, then persist for future reads
    let book = null;
    try {
      book = await fetchFromOpenLibrary(isbn);
      if (book) {
        upsertDetail(book).catch((err) =>
          console.error(`Failed to upsert detail for ISBN ${isbn}:`, err.message)
        );
      }
    } catch (err) {
      console.error(`Open Library detail fetch failed for ${isbn}:`, err.message);
    }

    if (!book) {
      return res.status(404).json({ error: 'No book found for this ISBN' });
    }

    res.json(book);
  } catch (error) {
    console.error('Book detail API Error:', error);
    next(error);
  }
});

module.exports = router;
