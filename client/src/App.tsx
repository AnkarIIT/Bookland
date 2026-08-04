import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import AuthPage from './pages/Auth';
import BookDetailPage from './pages/BookDetail';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { Library, Moon, Sun, Settings2, LogOut, User as UserIcon } from 'lucide-react';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, restore, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 glass dark:glass-dark w-full border-b border-white/20 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group transition-all">
              <div className="p-1.5 bg-primary-600 rounded-lg shadow-primary/20 shadow-lg group-hover:scale-110 transition-transform">
                <Library className="text-white" size={20} />
              </div>
              <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                Bookland
              </span>
            </Link>
            <nav className="flex items-center gap-4 md:gap-8">
              <Link
                to="/search"
                className={`hidden sm:block text-sm font-semibold transition-colors ${
                  location.pathname === '/search'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                Explore Library
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90 shadow-sm"
                  title={`Switch theme (Current: ${theme})`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' && <Sun size={20} />}
                  {theme === 'dark' && <Moon size={20} />}
                  {theme === 'system' && <Settings2 size={20} />}
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                {user ? (
                  <>
                    <span className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="p-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full">
                        <UserIcon size={16} />
                      </span>
                      {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="hidden md:block bg-primary-600 text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-primary-700 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/book/:isbn" element={<BookDetailPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <footer className="w-full bg-slate-900 dark:bg-black text-white py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-8 mb-8">
            <div className="flex items-center gap-2 opacity-80">
              <Library size={24} className="text-primary-400" />
              <span className="text-2xl font-display font-bold tracking-tighter">Bookland</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Bookland Digital Library. Built for the era of intelligence.</p>
            <p className="flex items-center gap-1.5 leading-none">
              Design by <span className="text-white font-medium">Antigravity</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
