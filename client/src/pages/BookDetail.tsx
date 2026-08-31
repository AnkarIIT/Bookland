import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, Info, Calendar, Globe, FileText, Building2, BookMarked, Save, Check, Copy } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useCollectionStore } from '../store/useCollectionStore';
import type { BookDetail } from '../types';
import { SEO, getBookSchema, getBreadcrumbSchema } from '../components/SEO';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  
  const { isSaved, saveBook, removeBook } = useCollectionStore();
  const [isSavedLocal, setIsSavedLocal] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setBook(null);
    setImageFailed(false);
    setIsLoading(true);

    apiFetch<BookDetail>(`/api/books/${id}`)
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
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsSavedLocal(isSaved(id));
    }
  }, [id, isSaved, book]);

  const handleSave = async () => {
    if (!book) return;
    if (isSavedLocal) {
      await removeBook(book.id);
    } else {
      await saveBook(book.id);
    }
    setIsSavedLocal(!isSavedLocal);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-muted">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          <p className="font-semibold text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center text-center py-20 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
          <Info size={30} />
        </div>
        <h1 className="font-display font-bold text-3xl text-ink dark:text-white">Book not found</h1>
        <p className="mt-3 text-muted dark:text-dark-muted font-medium">{error}</p>
        <Link to="/search" className="btn-secondary mt-8">
          <ArrowLeft size={16} /> Back to search
        </Link>
      </div>
    );
  }

  const authors = book.authors?.join(', ') || 'Unknown Author';
  const readUrl = book.readable ? `/read/${book.read_kind}/${book.read_id}` : undefined;
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search' },
    { name: book.title, url: '' },
  ];

  return (
    <div className="animate-fade-up">
      <SEO
        title={book.title}
        description={book.description || `Read ${book.title} by ${authors} on Bookland.`}
        canonical={`/book/${book.id}`}
        ogImage={book.cover_url ?? undefined}
        structuredData={[
          getBookSchema({
            title: book.title,
            authors: book.authors,
            isbn13: book.isbn_13 ?? undefined,
            publishedYear: book.published_year ?? undefined,
            description: book.description ?? undefined,
            coverUrl: book.cover_url ?? undefined,
            publisher: book.publisher ?? undefined,
            pageCount: book.page_count ?? undefined,
            language: book.language ?? undefined,
            isFree: book.readable,
            readUrl,
          }),
          getBreadcrumbSchema(breadcrumbs),
        ]}
      />
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted dark:text-dark-muted hover:text-ink dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to search
        </Link>
        
        {book.readable && (
          <Link
            to={readUrl}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <BookMarked size={16} /> Read
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 md:gap-14">
        {/* Cover */}
        <div className="md:sticky md:top-24 self-start">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-raised shadow-lift flex items-center justify-center">
            {book.cover_url && !imageFailed ? (
              <img
                src={book.cover_url}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <BookOpen size={72} strokeWidth={1} className="text-muted opacity-40" />
            )}
          </div>

          <div className="mt-5 space-y-3">
            {book.readable && (
              <Link
                to={`/read/${book.read_kind}/${book.read_id}`}
                className="btn-primary w-full !py-3 text-[15px] justify-center"
              >
                <BookMarked size={18} className="mr-1.5" /> Read this book
              </Link>
            )}
            
            <button
              onClick={handleSave}
              className={`w-full px-4 py-3 rounded-full font-semibold text-sm transition-all flex items-center justify-center ${
                isSavedLocal 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-slate-100 dark:bg-dark-raised text-ink dark:text-white hover:bg-slate-200 dark:hover:bg-dark-raised border border-slate-200 dark:border-dark-border'
              }`}
            >
              {isSavedLocal ? (
                <>
                  <Check size={16} className="mr-1.5" /> Saved
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1.5" /> Save to library
                </>
              )}
            </button>

            {book.isbn_13 && (
              <button
                onClick={() => navigator.clipboard.writeText(book.isbn_13!)}
                className="w-full px-4 py-2.5 rounded-full font-medium text-sm text-muted dark:text-dark-muted hover:text-ink dark:hover:text-white transition-colors border border-slate-200 dark:border-dark-border"
              >
                <Copy size={14} className="inline mr-1.5" /> Copy ISBN
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="chip bg-slate-100 dark:bg-dark-raised text-muted dark:text-dark-muted capitalize">
              {book.source}
            </span>
            {book.readable && (
              <span className="chip bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                Free to read
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold tracking-tightest text-3xl md:text-4xl leading-[1.08] text-ink dark:text-white">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mt-2 text-xl font-medium text-muted dark:text-dark-muted">{book.subtitle}</p>
          )}
          <p className="mt-3 text-lg font-semibold text-primary-600 dark:text-primary-400">{authors}</p>

          {/* Quick facts */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted dark:text-dark-muted">
            {book.published_year && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> First published {book.published_year}
              </span>
            )}
            {book.language && (
              <span className="inline-flex items-center gap-1.5">
                <Globe size={14} /> {book.language}
              </span>
            )}
            {book.page_count && (
              <span className="inline-flex items-center gap-1.5">
                <FileText size={14} /> {book.page_count} pages
              </span>
            )}
            {book.publisher && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} /> {book.publisher}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-mono text-xs">
              {book.gutenberg_id ? `Gutenberg #${book.gutenberg_id}` : book.isbn_13 ? `ISBN ${book.isbn_13}` : 'Unknown ID'}
            </span>
          </div>

          {book.description && (
            <section className="mt-8">
              <h2 className="text-xs uppercase tracking-widest font-bold text-muted dark:text-dark-muted mb-3">
                About this work
              </h2>
              <p className="text-[17px] text-ink dark:text-white font-normal leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-dark-raised/50 p-4 rounded-xl">
                {book.description}
              </p>
            </section>
          )}

          {book.subjects && book.subjects.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xs uppercase tracking-widest font-bold text-muted dark:text-dark-muted mb-3">
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {book.subjects.slice(0, 24).map((subject) => (
                  <span key={subject} className="chip bg-slate-100 dark:bg-dark-raised text-muted dark:text-dark-muted text-xs">
                    {subject}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// Import Copy icon
import { Copy } from 'lucide-react';

export default BookDetailPage;