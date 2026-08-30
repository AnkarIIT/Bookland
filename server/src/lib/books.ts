import { db } from '../config/db';

export const isbnSlug = (isbn: string) => `isbn-${isbn}`;
export const gutenbergSlug = (id: number) => `gutenberg-${id}`;

export const parseSlug = (slug: string): { kind: 'isbn'; id: string } | { kind: 'gutenberg'; id: number } | null => {
  if (typeof slug !== 'string') return null;
  if (slug.startsWith('isbn-')) {
    const isbn = slug.slice(5).replace(/\D/g, '').slice(0, 13);
    return isbn ? { kind: 'isbn', id: isbn } : null;
  }
  if (slug.startsWith('gutenberg-')) {
    const id = Number(slug.slice(10));
    if (Number.isInteger(id) && id > 0) return { kind: 'gutenberg', id };
  }
  return null;
};

export interface OpenLibraryDoc {
  isbn?: string[];
  ia?: string[];
  ebook_access?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  title?: string;
}

export interface GutenbergDoc {
  id: number;
  title?: string;
  authors?: Array<{ name: string; birth_year?: number }>;
  languages?: string[];
  subjects?: string[];
  summaries?: string[];
  formats?: Record<string, string>;
  media_type?: string;
}

export const mapOpenLibraryDoc = (doc: OpenLibraryDoc) => {
  const isbnList = doc.isbn || [];
  const isbn13 =
    isbnList.find((i: string) => typeof i === 'string' && /^\d{13}$/.test(i)) ||
    isbnList.find((i: string) => typeof i === 'string' && i.replace(/\D/g, '').length === 13);

  if (!isbn13) return null;

  const archiveId = Array.isArray(doc.ia) && doc.ia.length > 0 ? doc.ia[0] : null;
  const readable = doc.ebook_access === 'fulltext' && !!archiveId;

  return {
    id: isbnSlug(isbn13.replace(/\D/g, '')),
    isbn_13: isbn13.replace(/\D/g, ''),
    gutenberg_id: null,
    archive_id: archiveId,
    title: doc.title || 'Unknown Title',
    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
    published_year: doc.first_publish_year || null,
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`
      : null,
    source: 'openlibrary',
    readable,
    read_kind: readable ? 'archive' : null,
    read_id: readable ? archiveId : null,
  };
};

export const mapGutenbergDoc = (doc: GutenbergDoc) => ({
  id: gutenbergSlug(doc.id),
  isbn_13: null,
  gutenberg_id: doc.id,
  archive_id: null,
  title: doc.title || 'Unknown Title',
  authors: (doc.authors || []).map((a: any) => a.name).filter(Boolean),
  published_year: doc.authors && doc.authors.length > 0 ? doc.authors[0].birth_year || null : null,
  cover_url: null,
  source: 'gutenberg',
  readable: true,
  read_kind: 'gutenberg',
  read_id: String(doc.id),
});

export const upsertOpenLibraryBooks = async (books: any[]): Promise<void> => {
  if (books.length === 0) return;
  await db.query(
    `INSERT INTO books (isbn_13, title, authors, published_year, cover_url, archive_id, source)
     SELECT
       u.isbn_13,
       u.title,
       jsonb_array_to_text_array(u.authors),
       u.published_year,
       u.cover_url,
       u.archive_id,
       u.source
     FROM UNNEST($1::text[], $2::text[], $3::jsonb[], $4::int[], $5::text[], $6::text[], $7::text[])
       AS u(isbn_13, title, authors, published_year, cover_url, archive_id, source)
     ON CONFLICT (isbn_13) DO UPDATE SET
       title = EXCLUDED.title,
       authors = EXCLUDED.authors,
       published_year = EXCLUDED.published_year,
       cover_url = COALESCE(books.cover_url, EXCLUDED.cover_url),
       archive_id = COALESCE(books.archive_id, EXCLUDED.archive_id),
       updated_at = CURRENT_TIMESTAMP`,
    [
      books.map((b) => b.isbn_13),
      books.map((b) => b.title),
      books.map((b) => JSON.stringify(b.authors)),
      books.map((b) => b.published_year),
      books.map((b) => b.cover_url),
      books.map((b) => b.archive_id),
      books.map(() => 'openlibrary'),
    ]
  );
};

export const upsertGutenbergBooks = async (books: any[]): Promise<void> => {
  if (books.length === 0) return;
  await db.query(
    `INSERT INTO books (gutenberg_id, title, authors, published_year, source)
     SELECT
       u.gutenberg_id,
       u.title,
       jsonb_array_to_text_array(u.authors),
       u.published_year,
       u.source
     FROM UNNEST($1::int[], $2::text[], $3::jsonb[], $4::int[], $5::text[])
       AS u(gutenberg_id, title, authors, published_year, source)
     ON CONFLICT (gutenberg_id) DO UPDATE SET
       title = EXCLUDED.title,
       authors = EXCLUDED.authors,
       published_year = EXCLUDED.published_year,
       updated_at = CURRENT_TIMESTAMP`,
    [
      books.map((b) => b.gutenberg_id),
      books.map((b) => b.title),
      books.map((b) => JSON.stringify(b.authors)),
      books.map((b) => b.published_year),
      books.map(() => 'gutenberg'),
    ]
  );
};

export const rowToBook = (row: any) => ({
  id: row.isbn_13 ? isbnSlug(row.isbn_13) : gutenbergSlug(row.gutenberg_id),
  isbn_13: row.isbn_13 || null,
  gutenberg_id: row.gutenberg_id || null,
  archive_id: row.archive_id || null,
  title: row.title,
  authors: row.authors || [],
  published_year: row.published_year,
  cover_url: row.cover_url || null,
  source: row.source || 'local',
  readable: !!(row.gutenberg_id || row.archive_id),
  read_kind: row.gutenberg_id ? 'gutenberg' : row.archive_id ? 'archive' : null,
  read_id: row.gutenberg_id ? String(row.gutenberg_id) : row.archive_id || null,
});