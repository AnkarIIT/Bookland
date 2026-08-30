import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowUpRight, BookMarked, FileText } from 'lucide-react';
import type { Book } from '../types';
import { BookCover } from './ui';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const authors = book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author';

  return (
    <Link
      to={`/book/${book.id}`}
      className="group flex items-center gap-5 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-dark-border bg-transparent hover:bg-surface dark:hover:bg-dark-surface transition-all duration-200"
    >
      {/* Cover */}
      <BookCover
        id={book.id}
        src={book.cover_url || ''}
        alt={`Cover of ${book.title}`}
        width={56}
        height={80}
        className="shrink-0 shadow-soft"
      />

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <h3 className="font-display font-bold text-[17px] md:text-lg text-ink dark:text-white leading-snug truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm font-medium text-muted dark:text-dark-muted truncate mt-0.5">{authors}</p>

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {book.published_year && (
            <span className="chip bg-slate-100 dark:bg-dark-raised text-muted dark:text-dark-muted">{book.published_year}</span>
          )}
          <span className="chip bg-slate-100 dark:bg-dark-raised text-muted dark:text-dark-muted capitalize">{book.source}</span>
          {book.readable && (
            <span className="chip bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              {book.read_kind === 'gutenberg' ? <FileText size={11} /> : <BookMarked size={11} />}
              {book.read_kind === 'gutenberg' ? 'Read free' : 'Read'}
            </span>
          )}
        </div>
      </div>

      <ArrowUpRight
        size={20}
        className="text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary-600 transition-all duration-200 shrink-0"
        strokeWidth={2}
      />
    </Link>
  );
};

export default BookCard;