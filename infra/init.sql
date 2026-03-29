CREATE EXTENSION IF NOT EXISTS vector;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn_13 VARCHAR(13) UNIQUE NOT NULL,
    isbn_10 VARCHAR(10),
    title TEXT NOT NULL,
    subtitle TEXT,
    authors TEXT[] NOT NULL,
    publisher TEXT,
    published_year INTEGER,
    language VARCHAR(10),
    country_code VARCHAR(10),
    genre TEXT[],
    subjects TEXT[],
    description TEXT,
    page_count INTEGER,
    cover_url TEXT,
    is_free BOOLEAN DEFAULT false,
    read_url TEXT,
    file_path TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book buy links
CREATE TABLE IF NOT EXISTS book_buy_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_isbn VARCHAR(13) REFERENCES books(isbn_13) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    price DECIMAL(10, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_isbn VARCHAR(13) REFERENCES books(isbn_13) ON DELETE CASCADE,
    last_page INTEGER DEFAULT 0,
    progress_percent INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_isbn)
);

-- Saved books
CREATE TABLE IF NOT EXISTS saved_books (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_isbn VARCHAR(13) REFERENCES books(isbn_13) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_isbn)
);

-- Indexes for performance
CREATE INDEX idx_books_isbn_13 ON books(isbn_13);
CREATE INDEX idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX idx_books_authors ON books USING gin(authors);
CREATE INDEX idx_books_genre ON books USING gin(genre);
