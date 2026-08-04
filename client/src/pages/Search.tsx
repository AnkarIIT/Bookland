import React, { useEffect, useState } from 'react';
import { useSearchStore, type ContentType } from '../store/useSearchStore';
import BookCard from '../components/BookCard';
import SegmentedControl from '../components/SegmentedControl';
import { Search as SearchIcon, Info, Library, FlaskConical, Newspaper, ArrowLeft } from 'lucide-react';

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'book', label: 'Books' },
  { value: 'paper', label: 'Papers' },
  { value: 'article', label: 'Articles' },
];

const COMING_SOON: Record<Exclude<ContentType, 'all' | 'book'>, { title: string; description: string }> = {
  paper: {
    title: 'Research papers, on the way',
    description: 'We\'re connecting to open-access repositories (arXiv, PubMed, DOAJ) so you can search and read peer-reviewed research. Papers arrive in an upcoming release.',
  },
  article: {
    title: 'Articles & essays, on the way',
    description: 'Editorial content, long-form journalism and essays from open archives will be indexed here soon. Check back shortly.',
  },
};

const Search = () => {
  const { searchQuery, contentType, results, isLoading, error, performSearch, setSearchQuery, setContentType } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Auto-search when landing with a query already set
  useEffect(() => {
    if (searchQuery && results.length === 0 && !isLoading && !error && (contentType === 'all' || contentType === 'book')) {
      performSearch(searchQuery);
    }
  }, [searchQuery, results.length, isLoading, error, contentType, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    setSearchQuery(localQuery.trim());
    performSearch(localQuery.trim());
  };

  const handleTypeChange = (type: ContentType) => {
    setContentType(type);
    if (localQuery.trim() && (type === 'all' || type === 'book')) {
      performSearch(localQuery.trim());
    }
  };

  const comingSoon = contentType === 'paper' || contentType === 'article' ? COMING_SOON[contentType] : null;
  const showComingSoon = comingSoon !== null;
  const heading = searchQuery ? `Results for “${searchQuery}”` : 'Explore the archive';

  return (
    <div className="animate-fade-up">
      {/* Search bar */}
      <div className="sticky top-14 z-40 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 bg-canvas/85 dark:bg-dark-canvas/85 backdrop-blur-2xl">
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <SearchIcon size={19} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="input-base py-3.5 pr-24 text-[16px] shadow-soft"
              style={{ paddingLeft: '3rem' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary-700 transition-all active:scale-95"
            >
              Search
            </button>
          </div>
          <div className="mt-3">
            <SegmentedControl size="sm" options={TYPE_OPTIONS} value={contentType} onChange={handleTypeChange} />
          </div>
        </form>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink dark:text-white">
          {heading}
        </h1>
        {!isLoading && !showComingSoon && results.length > 0 && (
          <span className="text-sm font-semibold text-muted dark:text-dark-muted">
            {results.length} results
          </span>
        )}
      </div>

      {/* Coming soon: papers / articles */}
      {showComingSoon && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6">
            {contentType === 'paper' ? <FlaskConical size={30} /> : <Newspaper size={30} />}
          </div>
          <h2 className="font-display font-bold text-2xl text-ink dark:text-white">{comingSoon.title}</h2>
          <p className="mt-3 max-w-md text-muted dark:text-dark-muted font-medium leading-relaxed">
            {comingSoon.description}
          </p>
          <button onClick={() => handleTypeChange('book')} className="btn-secondary mt-8">
            <ArrowLeft size={16} /> Explore books instead
          </button>
        </div>
      )}

      {/* Error */}
      {!showComingSoon && error && (
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
            <Info size={30} />
          </div>
          <h2 className="font-display font-bold text-2xl text-ink dark:text-white">Could not reach the archive</h2>
          <p className="mt-3 max-w-md text-muted dark:text-dark-muted font-medium">{error}</p>
          <button onClick={() => performSearch(searchQuery)} className="btn-primary mt-8">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {!showComingSoon && isLoading && (
        <div className="space-y-3 mt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-5 p-4 rounded-2xl">
              <div className="w-14 h-20 rounded-lg skeleton shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 skeleton rounded-full w-2/3" />
                <div className="h-3 skeleton rounded-full w-1/3" />
                <div className="h-3 skeleton rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!showComingSoon && !isLoading && !error && results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!showComingSoon && !isLoading && !error && results.length === 0 && searchQuery && (
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-raised text-muted flex items-center justify-center mb-6">
            <SearchIcon size={30} strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-bold text-2xl text-ink dark:text-white">No matches in the archive</h2>
          <p className="mt-3 max-w-md text-muted dark:text-dark-muted font-medium">
            We couldn't find anything for “{searchQuery}”. Try a broader keyword, or check your spelling.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!showComingSoon && !isLoading && !error && results.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6">
            <Library size={30} strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-bold text-2xl text-ink dark:text-white">Search the global archive</h2>
          <p className="mt-3 max-w-md text-muted dark:text-dark-muted font-medium">
            Millions of books from Open Library and Project Gutenberg, indexed for instant results.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
