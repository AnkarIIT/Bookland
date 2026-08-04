import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  const displayAuthors = book.authors && book.authors.length > 0 
    ? (book.authors.length > 2 
        ? `${book.authors[0]}, ${book.authors[1]} + ${book.authors.length - 2} more`
        : book.authors.join(', '))
    : 'Unknown Author';

  return (
    <Link
      to={`/book/${book.isbn_13}`}
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-elevated hover:border-primary-500/50 dark:hover:border-primary-400/50 hover:-translate-y-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
      {/* Cover Image Section */}
      <div className="aspect-[2/3] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative">
        {book.cover_url && !imageFailed ? (
          <img 
            src={book.cover_url} 
            alt={`Cover of ${book.title}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="text-slate-300 dark:text-slate-800 flex flex-col items-center p-6 text-center">
            <BookOpen size={64} strokeWidth={1} className="mb-4 opacity-50" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">No Visual Record</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Publication Badge */}
        {book.published_year && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass dark:glass-dark text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-white/40 dark:border-slate-700 shadow-sm transition-transform duration-500 group-hover:scale-110">
            {book.published_year}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4 line-clamp-1 opacity-80" title={book.authors?.join(', ')}>
          {displayAuthors}
        </p>
        
        <div className="mt-auto pt-4 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800/50">
          <span>ISBN Index</span>
          <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[100px]" title={book.isbn_13}>
            {book.isbn_13}
          </span>
        </div>
      </div>
      
      {/* Decorative Glow (Hover) */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </Link>
  );
};

export default BookCard;
