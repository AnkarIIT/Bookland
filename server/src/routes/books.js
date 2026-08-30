const express = require('express');
const router = express.Router();
const db = require('../config/db');
const gutenberg = require('../lib/gutenberg');
const { parseSlug, rowToBook, upsertGutenbergBooks } = require('../lib/books');
const { validate, bookKeySchema } = require('../middleware/validate');

const OL_BOOKS_URL = 'https://openlibrary.org/api/books';

async function fetchOpenLibraryDetail(isbn) {
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
    id: `isbn-${isbn}`,
    isbn_13: isbn,
    gutenberg_id: null,
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

const DETAIL_FIELDS = `
  isbn_13, gutenberg_id, archive_id, title, subtitle, authors, publisher, published_year,
  language, subjects, description, page_count, cover_url, is_free, read_url, source
`;

async function upsertOpenLibraryDetail(book) {
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

const getLocalBook = async (whereClause, params) => {
  const { rows } = await db.query(`SELECT ${DETAIL_FIELDS} FROM books ${whereClause} LIMIT 1`, params);
  if (rows.length === 0) return null;
  return { ...rowToBook(rows[0]), ...rows[0] };
};

router.get('/:key', validate(bookKeySchema, 'params'), async (req, res, next) => {
  try {
    const parsed = parseSlug(req.validatedParams.key);

    if (!parsed) {
      return res.status(400).json({ error: 'A valid book identifier is required' });
    }

    let localBook = null;
    try {
      localBook =
        parsed.kind === 'isbn'
          ? await getLocalBook('WHERE isbn_13 = $1', [parsed.id])
          : await getLocalBook('WHERE gutenberg_id = $1', [parsed.id]);
    } catch (dbErr) {
      console.error('Local book lookup failed, falling back upstream:', dbErr.message);
    }

    if (localBook) {
      return res.json(localBook);
    }

    let book = null;

    if (parsed.kind === 'gutenberg') {
      try {
        const doc = await gutenberg.getById(parsed.id);
        book = {
          id: `gutenberg-${doc.id}`,
          gutenberg_id: doc.id,
          isbn_13: null,
          title: doc.title || 'Unknown Title',
          subtitle: null,
          authors: (doc.authors || []).map((a) => a.name).filter(Boolean),
          publisher: null,
          published_year: doc.authors && doc.authors.length > 0 ? doc.authors[0].birth_year || null : null,
          language: (doc.languages || []).join(', ') || null,
          subjects: (doc.subjects || []).slice(0, 20),
          description: (doc.summaries || []).join(' ') || null,
          page_count: null,
          cover_url: gutenberg.getCoverUrl(doc),
          source: 'gutenberg',
          readable: true,
          read_kind: 'gutenberg',
          read_id: String(doc.id),
        };
        const mapped = {
          gutenberg_id: doc.id,
          title: book.title,
          authors: book.authors,
          published_year: book.published_year,
        };
        upsertGutenbergBooks([mapped]).catch((err) =>
          console.error(`Failed to upsert gutenberg ${doc.id}:`, err.message)
        );
      } catch (err) {
        console.error(`Gutenberg detail fetch failed for ${parsed.id}:`, err.message);
      }
    } else {
      try {
        book = await fetchOpenLibraryDetail(parsed.id);
        if (book) {
          upsertOpenLibraryDetail(book).catch((err) =>
            console.error(`Failed to upsert detail for ISBN ${parsed.id}:`, err.message)
          );
        }
      } catch (err) {
        console.error(`Open Library detail fetch failed for ${parsed.id}:`, err.message);
      }
    }

    if (!book) {
      return res.status(404).json({ error: 'No book found for this identifier' });
    }

    res.json(book);
  } catch (error) {
    console.error('Book detail API Error:', error);
    next(error);
  }
});

module.exports = router;