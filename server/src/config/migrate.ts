import { db } from './db';

const MIGRATIONS = [
  `ALTER TABLE books ALTER COLUMN isbn_13 DROP NOT NULL`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS gutenberg_id INTEGER`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS archive_id TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS content TEXT`,
  `ALTER TABLE books ADD COLUMN IF NOT EXISTS content_url TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS books_gutenberg_id_key ON books(gutenberg_id)`,
  `CREATE INDEX IF NOT EXISTS idx_books_source ON books(source)`,
];

export const runMigrations = async () => {
  try {
    for (const sql of MIGRATIONS) {
      await db.query(sql);
    }
    console.log('DB migrations applied');
  } catch (err) {
    console.error('DB migration failed:', (err as Error).message);
  }
};