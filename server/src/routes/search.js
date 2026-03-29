const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    
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
    
    // 2. Fetch from Open Library API
    // Using fields limitation for faster response
    const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i,isbn`;
    
    const response = await fetch(olUrl);
    if (!response.ok) {
      throw new Error(`OpenLibrary API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const booksToReturn = [];

    // 3. Map responses and Insert to PostgreSQL
    for (const doc of (data.docs || [])) {
      const isbnList = doc.isbn || [];
      // Look for a 13 character numeric string
      const isbn13 = isbnList.find(i => typeof i === 'string' && i.replace(/\D/g, '').length === 13);
      const cleanIsbn = isbn13 ? isbn13.replace(/\D/g, '') : null;
      
      // We skip results without a clean ISBN13 to maintain strict data integrity for the MVP
      if (!cleanIsbn) continue;

      const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false` : null;
      
      const book = {
        isbn_13: cleanIsbn,
        title: doc.title || 'Unknown Title',
        authors: Array.isArray(doc.author_name) ? doc.author_name : [],
        published_year: doc.first_publish_year || null,
        cover_url: coverUrl,
      };

      booksToReturn.push(book);

      // Upsert into our PostgreSQL Database asynchronously
      const insertQuery = `
        INSERT INTO books (isbn_13, title, authors, published_year, cover_url, source)
        VALUES ($1, $2, $3, $4, $5, 'openlibrary')
        ON CONFLICT (isbn_13) DO UPDATE SET
          title = EXCLUDED.title,
          cover_url = COALESCE(books.cover_url, EXCLUDED.cover_url)
      `;
      // We purposefully don't await this inside the loop so we don't slow down the user's request.
      db.query(insertQuery, [
        book.isbn_13,
        book.title,
        book.authors,
        book.published_year,
        book.cover_url
      ]).catch(err => console.error(`Failed to insert ISBN ${book.isbn_13}`, err.message));
    }

    // 4. Cache the results for 1 hour to prevent API throttling
    if (redisClient.isReady && booksToReturn.length > 0) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(booksToReturn));
    }

    res.json(booksToReturn);
  } catch (error) {
    console.error('Search API Error:', error);
    next(error);
  }
});

module.exports = router;
