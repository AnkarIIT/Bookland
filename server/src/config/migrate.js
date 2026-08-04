const db = require('./db');

const MIGRATIONS = [
  // Books may now come from Project Gutenberg and lack an ISBN
  `ALTER TABLE books ALTER COLUMN isbn_13 DROP NOT NULL`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS gutenberg_id INTEGER`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS archive_id TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS content TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS content_url TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS books_gutenberg_id_key ON books(gutenberg_id)`,
  `CREATE INDEX IF NOT EXISTS idx_books_source ON books(source)`,
];

const runMigrations = async () => {
  try {
    for (const sql of MIGRATIONS) {
      await db.query(sql);
    }
    console.log('DB migrations applied');
  } catch (err) {
    console.error('DB migration failed:', err.message);
  }
};

module.exports = { runMigrations };
