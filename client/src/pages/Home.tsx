import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, Sparkles } from 'lucide-react';
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

  const handleSuggested = (suggested: string) => {
    setQuery(suggested);
    setSearchQuery(suggested);
    performSearch(suggested);
    navigate('/search');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-5xl mx-auto text-center px-4 py-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-bold mb-8 animate-fade-in border border-primary-100 shadow-sm">
        <Sparkles size={14} className="animate-pulse" />
        <span>Open Infrastructure for Human Knowledge</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.05]">
        Human knowledge, <br />
        <span className="text-gradient">built for everyone.</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-500 mb-14 max-w-3xl text-balance font-medium leading-relaxed">
        Search millions of books from the Open Library. High-performance infrastructure for the next generation of digital archives.
      </p>
      
      <form 
        onSubmit={handleSearch} 
        className="w-full max-w-3xl relative group transition-all duration-500"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
        <div className="relative shadow-premium rounded-[2.25rem] overflow-hidden flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-focus-within:border-primary-500/50 transition-all">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full py-6 pl-8 pr-20 text-xl outline-none bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute right-3 top-3 bottom-3 bg-primary-600 text-white px-8 rounded-full font-bold hover:bg-primary-700 transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95"
          >
            <SearchIcon size={22} strokeWidth={2.5} />
          </button>
        </div>
      </form>
      
      <div className="mt-16 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex flex-col items-center gap-6">
        <span>Popular categories</span>
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => handleSuggested('1984')} 
            className="bg-white dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 transition-all px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 active:scale-95"
          >
            🔍 George Orwell
          </button>
          <button 
            onClick={() => handleSuggested('Tolkien')} 
            className="bg-white dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 transition-all px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 active:scale-95"
          >
            🔍 J.R.R. Tolkien
          </button>
          <button 
            onClick={() => handleSuggested('Science Fiction')} 
            className="bg-white dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 transition-all px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 active:scale-95"
          >
            🔍 Sci-Fi Classics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
