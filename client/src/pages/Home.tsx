import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useSearchStore, type ContentType } from '../store/useSearchStore';
import SegmentedControl from '../components/SegmentedControl';

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'book', label: 'Books' },
  { value: 'paper', label: 'Papers' },
  { value: 'article', label: 'Articles' },
];

const FEATURED = [
  { gutenbergId: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
  { gutenbergId: 2701, title: 'Moby Dick', author: 'Herman Melville' },
  { gutenbergId: 345, title: 'Dracula', author: 'Bram Stoker' },
  { gutenbergId: 84, title: 'Frankenstein', author: 'Mary Shelley' },
  { gutenbergId: 5200, title: 'The Metamorphosis', author: 'Franz Kafka' },
  { gutenbergId: 174, title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
];

const gutenbergCover = (id: number) =>
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;

const Home = () => {
  const [query, setQuery] = useState('');
  const [contentType, setContentTypeState] = useState<ContentType>('all');
  const navigate = useNavigate();
  const { setSearchQuery, setContentType, performSearch } = useSearchStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchQuery(query.trim());
    setContentType(contentType);
    performSearch(query.trim());
    navigate('/search');
  };

  return (
    <div className="flex flex-col items-center animate-fade-up">
      {/* Hero */}
      <div className="text-center pt-8 md:pt-16 pb-12 md:pb-16 w-full max-w-3xl mx-auto">
        <h1 className="font-display font-extrabold tracking-tightest text-[44px] leading-[1.05] md:text-7xl text-ink dark:text-white">
          Every book.
          <br />
          Every idea. <span className="text-primary-600">Found.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl font-medium text-muted dark:text-dark-muted leading-relaxed max-w-2xl mx-auto">
          Search millions of books, research papers, and articles from the world's public libraries — and read them right here.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search the world's knowledge..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-base py-4 pl-13 pr-32 text-[17px] shadow-soft"
              style={{ paddingLeft: '3.25rem' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-700 transition-all active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-5 flex justify-center">
          <SegmentedControl options={TYPE_OPTIONS} value={contentType} onChange={setContentTypeState} />
        </div>
      </div>

      {/* Featured */}
      <section className="w-full max-w-4xl mx-auto mt-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-xl md:text-2xl tracking-tight text-ink dark:text-white">
              Start reading tonight
            </h2>
            <p className="text-sm font-medium text-muted dark:text-dark-muted mt-1">
              Free classics, ready to read.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/search');
            }}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
          >
            Browse all <ArrowRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {FEATURED.map((book) => (
            <button
              key={book.gutenbergId}
              onClick={() => navigate(`/book/gutenberg-${book.gutenbergId}`)}
              className="group text-left"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-raised shadow-soft group-hover:shadow-lift group-hover:-translate-y-1 transition-all duration-300">
                <img
                  src={gutenbergCover(book.gutenbergId)}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-ink dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                {book.title}
              </p>
              <p className="text-xs font-medium text-muted dark:text-dark-muted truncate">{book.author}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
