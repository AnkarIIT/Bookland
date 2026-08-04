export interface Book {
  isbn_13: string;
  title: string;
  authors: string[];
  published_year?: number | null;
  cover_url?: string | null;
  source?: string;
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
