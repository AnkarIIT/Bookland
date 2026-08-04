import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, Info, Calendar, Globe, FileText, Building2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { BookDetail } from '../types';

const BookDetailPage: React.FC = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setBook(null);
    setImageFailed(false);
    setIsLoading(true);

    apiFetch<BookDetail>(`/api/books/${isbn}`)
      .then((data) => {
        if (!cancelled) setBook(data);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err.message || 'Failed to load book');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isbn]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 size={40} className="animate-spin text-primary-600" />
          <p className="font-semibold">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium flex flex-col items-center justify-center min-h-[40vh] text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
          <Info size={40} />
        </div>
        <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-3">Book not found</h3>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">{error}</p>
        <Link
          to="/search"
          className="mt-8 inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:opacity-80 transition-all"
        >
          <ArrowLeft size={18} /> Back to search
        </Link>
      </div>
    );
  }

  const authors = book.authors?.join(', ') || 'Unknown Author';

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <Link
        to="/search"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to search results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10">
        <div className="md:sticky md:top-24 self-start">
          <div className="aspect-[2/3] bg-slate-100 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-elevated flex items-center justify-center">
            {book.cover_url && !imageFailed ? (
              <img
                src={book.cover_url}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="text-slate-300 dark:text-slate-800 flex flex-col items-center p-8 text-center">
                <BookOpen size={96} strokeWidth={1} className="mb-4 opacity-50" />
                <span className="text-xs uppercase font-bold tracking-[0.2em] opacity-40">No Visual Record</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">ISBN-13</p>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all">{book.isbn_13}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Published</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {book.published_year ? `${book.published_year}` : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mt-3 text-xl text-slate-500 font-medium">{book.subtitle}</p>
          )}
          <p className="mt-4 text-lg font-semibold text-primary-600 dark:text-primary-400">{authors}</p>

          {(book.publisher || book.language || book.page_count) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {book.publisher && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Building2 size={14} className="text-primary-500" /> {book.publisher}
                </span>
              )}
              {book.language && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Globe size={14} className="text-primary-500" /> {book.language}
                </span>
              )}
              {book.page_count && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <FileText size={14} className="text-primary-500" /> {book.page_count} pages
                </span>
              )}
              {book.published_year && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar size={14} className="text-primary-500" /> {book.published_year}
                </span>
              )}
            </div>
          )}

          {book.description && (
            <section className="mt-10">
              <h2 className="text-sm uppercase font-bold tracking-widest text-slate-400 mb-4">About this book</h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </section>
          )}

          {book.subjects && book.subjects.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm uppercase font-bold tracking-widest text-slate-400 mb-4">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {book.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100 text-xs font-bold"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </section>
          )}

          {book.is_free && book.read_url && (
            <a
              href={book.read_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary/20"
            >
              Read for free <ArrowLeft size={16} className="rotate-180" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
