import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../store/useSearchStore';
import BookCard from '../components/BookCard';
import { SearchIcon, Info, Library } from 'lucide-react';

const Search = () => {
  const { searchQuery, results, isLoading, error, performSearch, setSearchQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // If component mounts and we have a query in store but no results/loading, trigger search
  useEffect(() => {
    if (searchQuery && results.length === 0 && !isLoading && !error) {
      performSearch(searchQuery);
    }
  }, [searchQuery, results.length, isLoading, error, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim());
      performSearch(localQuery.trim());
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12">
        <form onSubmit={handleSearch} className="relative group max-w-4xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500"></div>
          <div className="relative flex shadow-premium rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 focus-within:border-primary-500/50 transition-all bg-white dark:bg-slate-900">
            <input
              type="text"
              className="w-full p-5 pl-7 outline-none text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent"
              placeholder="Search books by title, author, or ISBN..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <button type="submit" className="bg-primary-600 text-white px-10 hover:bg-primary-700 transition-all flex items-center justify-center active:scale-95">
              <SearchIcon size={24} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            {searchQuery ? `Results for "${searchQuery}"` : 'Global Catalog'}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Accessing decentralized book data via Open Library API
          </p>
        </div>
        {!isLoading && results.length > 0 && searchQuery && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full border border-primary-100 text-sm font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            {results.length} volumes identified
          </div>
        )}
      </div>

      {error ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-premium flex flex-col items-center justify-center min-h-[40vh] text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <Info size={40} />
          </div>
          <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-3">Transmission Failed</h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">{error}</p>
          <button 
            onClick={() => performSearch(searchQuery)}
            className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[420px]">
              <div className="h-2/3 skeleton-shimmer w-full"></div>
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="h-5 skeleton-shimmer rounded-full w-full"></div>
                <div className="h-4 skeleton-shimmer rounded-full w-2/3 mb-auto opacity-60"></div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="h-5 skeleton-shimmer rounded w-12 opacity-40"></div>
                  <div className="h-5 skeleton-shimmer rounded w-24 opacity-40"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8 animate-fade-in">
          {results.map((book) => (
            <BookCard key={book.isbn_13} book={book} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-300 shadow-inner max-w-3xl mx-auto px-8">
          <div className="text-7xl mb-8 block drop-shadow-sm opacity-50 grayscale">🔍</div>
          <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-4">No results in archive</h3>
          <p className="text-xl text-slate-500 max-w-lg mx-auto text-balance leading-relaxed">
            We couldn't find any direct matches for <strong className="font-bold text-slate-900">"{searchQuery}"</strong>. Try broadening your keywords or checking for ISBN typos.
          </p>
        </div>
      ) : (
        <div className="text-center py-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] border border-slate-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10 px-8">
            <div className="w-24 h-24 bg-primary-500/20 text-primary-400 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary-500/30 group-hover:scale-110 transition-transform duration-500">
              <Library size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-4xl font-display font-extrabold text-white mb-6 tracking-tight">Access the Global Archive</h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Bookland connects directly to the Open Library via secure API bridge. Use the search above to explore millions of human-indexed records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
