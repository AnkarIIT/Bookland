import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';

function App() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="w-full p-4 flex justify-between items-center border-b border-gray-200">
        <div className="text-xl font-bold tracking-tight">
          <a href="/">📚 Bookland</a>
        </div>
        <nav className="text-sm font-medium">
          <a href="/search" className="text-accent hover:underline">Search</a>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200 mt-auto">
        &copy; {new Date().getFullYear()} Bookland - Built for scale.
      </footer>
    </div>
  );
}

export default App;
