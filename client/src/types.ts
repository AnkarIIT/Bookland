export type BookSource = 'openlibrary' | 'gutenberg' | 'local';
export type ReadKind = 'gutenberg' | 'archive';

export interface Book {
  id: string;
  isbn_13?: string | null;
  gutenberg_id?: number | null;
  archive_id?: string | null;
  title: string;
  authors: string[];
  published_year?: number | null;
  cover_url?: string | null;
  source: BookSource;
  readable: boolean;
  read_kind?: ReadKind | null;
  read_id?: string | null;
}

export interface BookDetail extends Book {
  subtitle?: string | null;
  publisher?: string | null;
  language?: string | null;
  subjects?: string[];
  description?: string | null;
  page_count?: number | null;
  is_free?: boolean;
  read_url?: string | null;
}

export interface ReadResponse {
  id: number;
  title: string;
  authors: string[];
  content: string;
}

export interface ArchiveReadResponse {
  id: string;
  title: string | null;
  embed_url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
