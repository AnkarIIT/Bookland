import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { Moon, Sun, Settings2, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { useSearchStore, type ContentType } from './store/useSearchStore';

const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const AuthPage = lazy(() => import('./pages/Auth'));
const BookDetailPage = lazy(() => import('./pages/BookDetail'));
const ReaderPage = lazy(() => import('./pages/Reader'));
const Info = lazy(() => import('./pages/Info'));
const NotFound = lazy(() => import('./pages/NotFound'));

const NAV_ITEMS: { label: string; type: ContentType }[] = [
  { label: 'Books', type: 'book' },
  { label: 'Papers', type: 'paper' },
  { label: 'Articles', type: 'article' },
];

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-muted">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-sm">Loading…</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

function App() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, restore, logout } = useAuthStore();
  const { setContentType } = useSearchStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    restore();
  }, [restore]);

  const goToContentType = (type: ContentType) => {
    setContentType(type);
    navigate('/search');
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-canvas dark:bg-dark-canvas font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-[17px] tracking-tighter text-ink dark:text-white"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-button">
                <BookOpen size={15} strokeWidth={2.5} />
              </span>
              Bookland
            </Link>

            <nav className="flex items-center gap-1 md:gap-2">
              <Link
                to="/search"
                className={`hidden md:block text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                  location.pathname === '/search'
                    ? 'text-primary-600'
                    : 'text-muted hover:text-ink dark:hover:text-white'
                }`}
              >
                Explore
              </Link>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => goToContentType(item.type)}
                  className="hidden md:block text-sm font-medium px-3 py-1.5 rounded-full transition-colors text-muted hover:text-ink dark:hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted hover:text-ink dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-dark-raised transition-all active:scale-90"
                title={`Switch theme (Current: ${theme})`}
                aria-label="Toggle theme"
              >
                {theme === 'light' && <Sun size={18} />}
                {theme === 'dark' && <Moon size={18} />}
                {theme === 'system' && <Settings2 size={18} />}
              </button>

              {user ? (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-white">
                    <UserIcon size={15} className="text-primary-600" />
                    {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-muted hover:text-red-500 hover:bg-slate-200/50 dark:hover:bg-dark-raised transition-all"
                    aria-label="Sign out"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary !px-5 !py-2">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className={
          location.pathname === '/'
            ? 'flex-1 w-full'
            : 'flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-12 md:py-16'
        }
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
            <Route path="/book/:id" element={<PageWrapper><BookDetailPage /></PageWrapper>} />
            <Route path="/read/:kind/:id" element={<PageWrapper><ReaderPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><AuthPage mode="login" /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><AuthPage mode="register" /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><Info kind="about" /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><Info kind="privacy" /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><Info kind="terms" /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </ErrorBoundary>
      </main>

      <footer className="mt-auto border-t border-slate-200/70 dark:border-dark-border/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-medium text-muted dark:text-dark-muted">
            Bookland — books, papers & articles, one search away.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted dark:text-dark-muted">
            <Link to="/about" className="hover:text-ink dark:hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-ink dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-ink dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
        <div className="border-t border-slate-200/70 dark:border-dark-border/70">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between text-xs font-medium text-muted/70 dark:text-dark-muted/70">
            <span>&copy; {new Date().getFullYear()} Bookland</span>
            <span>Built on public libraries & open knowledge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;