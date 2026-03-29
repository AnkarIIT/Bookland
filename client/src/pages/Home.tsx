import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';

const Home = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setSearchQuery, performSearch } = useSearchStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      performSearch(query.trim());
      navigate('/search');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto text-center px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-ink">
        Human knowledge, <br />
        <span className="text-accent">built for everyone.</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl text-balance">
        Search millions of books. Open infrastructure for the world's digital library.
      </p>
      
      <form onSubmit={handleSearch} className="w-full max-w-2xl relative shadow-xl rounded-full overflow-hidden flex border-2 border-transparent focus-within:border-accent transition-colors bg-white">
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          className="w-full pt-4 pb-4 pl-6 pr-16 text-lg outline-none bg-white font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-2 bottom-2 bg-accent text-white px-6 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <SearchIcon size={20} />
        </button>
      </form>
      
      <div className="mt-12 flex gap-4 text-sm text-gray-500">
        <button type="button" onClick={() => setQuery('1984')} className="bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-full border border-gray-200">
          🔍 Try "1984"
        </button>
        <button type="button" onClick={() => setQuery('Tolkien')} className="bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-full border border-gray-200">
          🔍 Try "Tolkien"
        </button>
      </div>
    </div>
  );
};

export default Home;
