const express = require('express');
const router = express.Router();
const db = require('../config/db');
const gutenberg = require('../lib/gutenberg');
const { validate, gutenbergReadSchema, archiveReadSchema } = require('../middleware/validate');

const gutenbergContentFromDb = async (id) => {
  const { rows } = await db.query(
    'SELECT gutenberg_id, title, authors, published_year, content FROM books WHERE gutenberg_id = $1',
    [id]
  );
  return rows[0] || null;
};

router.get('/gutenberg/:id', validate(gutenbergReadSchema, 'params'), async (req, res, next) => {
  try {
    const id = req.validatedParams.id;

    try {
      const row = await gutenbergContentFromDb(id);
      if (row && row.content) {
        return res.json({
          id: row.gutenberg_id,
          title: row.title,
          authors: row.authors || [],
          content: row.content,
        });
      }
    } catch (dbErr) {
      console.error('Local content lookup failed:', dbErr.message);
    }

    const doc = await gutenberg.getById(id);
    const textUrl = await gutenberg.getPlainTextUrl(doc);
    const rawText = await gutenberg.fetchText(textUrl);
    const content = gutenberg.extractBookText(rawText);

    if (!content) {
      return res.status(404).json({ error: 'No readable text found for this book' });
    }

    try {
      await db.query(
        `INSERT INTO books (gutenberg_id, title, authors, source, content, content_url)
         VALUES ($1, $2, $3, 'gutenberg', $4, $5)
         ON CONFLICT (gutenberg_id) DO UPDATE SET
           title = EXCLUDED.title,
           authors = EXCLUDED.authors,
           content = EXCLUDED.content,
           content_url = EXCLUDED.content_url,
           updated_at = CURRENT_TIMESTAMP`,
        [id, doc.title || 'Unknown Title', (doc.authors || []).map((a) => a.name), content, textUrl]
      );
    } catch (dbErr) {
      console.error('Failed to cache gutenberg content:', dbErr.message);
    }

    res.json({
      id,
      title: doc.title || 'Unknown Title',
      authors: (doc.authors || []).map((a) => a.name).filter(Boolean),
      content,
    });
  } catch (error) {
    console.error('Gutenberg read error:', error);
    if (error.message && error.message.includes('status')) {
      return res.status(404).json({ error: 'Book content not found on Project Gutenberg' });
    }
    next(error);
  }
});

router.get('/archive/:id', validate(archiveReadSchema, 'params'), async (req, res, next) => {
  try {
    const id = req.validatedParams.id;

    let title = null;
    try {
      const { rows } = await db.query('SELECT title FROM books WHERE archive_id = $1', [id]);
      if (rows.length > 0) title = rows[0].title;
    } catch (dbErr) {
      console.error('Local archive metadata lookup failed:', dbErr.message);
    }

    res.json({
      id,
      title,
      embed_url: `https://archive.org/embed/${encodeURIComponent(id)}`,
    });
  } catch (error) {
    console.error('Archive read error:', error);
    next(error);
  }
});

module.exports = router;