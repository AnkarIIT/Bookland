import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../store/useSearchStore';
import BookCard from '../components/BookCard';
import { SearchIcon } from 'lucide-react';

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
    <div className="w-full">
      <div className="mb-8 max-w-3xl">
        <form onSubmit={handleSearch} className="relative flex shadow-sm rounded-lg overflow-hidden border border-gray-300 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all bg-white">
          <input
            type="text"
            className="w-full p-4 pl-5 outline-none text-lg font-medium"
            placeholder="Search books by title, author, or ISBN..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <button type="submit" className="bg-accent text-white px-8 hover:bg-blue-700 transition-colors flex items-center justify-center">
            <SearchIcon size={24} />
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-2 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-ink">
          {searchQuery ? `Results for "${searchQuery}"` : 'Recent Books'}
        </h2>
        {!isLoading && results.length > 0 && searchQuery && (
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{results.length} found</span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200 flex flex-col items-center justify-center min-h-[40vh] text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold mb-2">Search Failed</h3>
          <p>{error}</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-x-6 gap-y-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-[360px]">
              <div className="h-64 bg-gray-200 w-full"></div>
              <div className="flex-1 p-5 flex flex-col gap-3">
                <div className="h-4 bg-gray-300 rounded-full w-full"></div>
                <div className="h-3 bg-gray-200 rounded-full w-2/3 mb-auto"></div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-x-6 gap-y-8">
          {results.map((book) => (
            <BookCard key={book.id || book.isbn_13} book={book} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <span className="text-6xl mb-4 block drop-shadow-sm">👻</span>
          <h3 className="text-2xl font-extrabold text-ink mb-2">No books found</h3>
          <p className="text-lg text-gray-500 max-w-lg mx-auto text-balance">
            We couldn't find any exact matches for <strong className="font-semibold text-gray-700">"{searchQuery}"</strong>. Try checking for typos or searching by a different author.
          </p>
        </div>
      ) : (
        <div className="text-center py-24 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-6xl mb-4 block drop-shadow-sm">📚</span>
          <h3 className="text-2xl font-extrabold text-ink mb-2">Explore the digital library</h3>
          <p className="text-lg text-gray-500">
            Search by title, author, or ISBN to browse real-world data populated directly from the Open Library.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
