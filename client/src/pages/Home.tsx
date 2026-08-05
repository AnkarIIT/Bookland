import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  ArrowRight,
  ArrowUpRight,
  Zap,
  BookOpen,
  Library,
  Database,
  Globe2,
  Sparkles,
  ShieldCheck,
  Quote,
  TrendingUp,
  Clock3,
  Layers,
  BookMarked,
} from 'lucide-react';
import { useSearchStore, type ContentType } from '../store/useSearchStore';
import SegmentedControl from '../components/SegmentedControl';
import Reveal from '../components/Reveal';

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

const HERO_BOOKS = [
  { gutenbergId: 11, title: 'Alice in Wonderland', author: 'Lewis Carroll', tilt: '-rotate-[14deg]', y: 'lg:translate-y-2', floatDelay: '0s' },
  { gutenbergId: 2701, title: 'Moby Dick', author: 'Herman Melville', tilt: '-rotate-[5deg]', y: 'lg:-translate-y-4', floatDelay: '0.8s' },
  { gutenbergId: 1342, title: 'Pride and Prejudice', author: 'Jane Austen', tilt: 'rotate-0', y: 'lg:-translate-y-10', floatDelay: '1.6s' },
  { gutenbergId: 345, title: 'Dracula', author: 'Bram Stoker', tilt: 'rotate-[5deg]', y: 'lg:-translate-y-4', floatDelay: '2.4s' },
  { gutenbergId: 84, title: 'Frankenstein', author: 'Mary Shelley', tilt: 'rotate-[14deg]', y: 'lg:translate-y-2', floatDelay: '3.2s' },
];

const TRENDING = [
  { gutenbergId: 174, title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', reads: '12.4K reads' },
  { gutenbergId: 5200, title: 'The Metamorphosis', author: 'Franz Kafka', reads: '9.8K reads' },
  { gutenbergId: 11, title: 'Alice in Wonderland', author: 'Lewis Carroll', reads: '8.1K reads' },
  { gutenbergId: 98, title: 'A Tale of Two Cities', author: 'Charles Dickens', reads: '7.6K reads' },
  { gutenbergId: 1727, title: 'The Odyssey', author: 'Homer', reads: '6.9K reads' },
];

const STATS = [
  { icon: Layers, value: '46M+', label: 'records indexed from Open Library' },
  { icon: BookMarked, value: '70K+', label: 'free classics, ready to read' },
  { icon: Clock3, value: '<100ms', label: 'cached searches with Redis' },
  { icon: TrendingUp, value: '1', label: 'home for books, papers & articles' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant search',
    body: 'Find any title across millions of records in milliseconds — repeated searches are cached in Redis for near-zero latency.',
  },
  {
    icon: BookOpen,
    title: 'Read anywhere',
    body: 'Thousands of public-domain classics rendered beautifully in your browser, on any device, with a reader tuned for focus.',
  },
  {
    icon: Library,
    title: 'One library',
    body: 'Books, research papers, and articles in a single, unified search — no more hopping between silos.',
  },
  {
    icon: Database,
    title: 'Built for scale',
    body: 'Relational persistence on PostgreSQL, with vector-ready foundations for future AI-powered discovery.',
  },
  {
    icon: Globe2,
    title: 'Open by design',
    body: 'Powered by the open knowledge of Open Library, Project Gutenberg, and the Internet Archive.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & yours',
    body: 'Personal accounts with JWT auth. Your collections stay private and accessible wherever you go.',
  },
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

  const goToSearch = (q?: string) => {
    const term = q ?? query.trim();
    if (term) {
      setSearchQuery(term);
      setContentType(contentType);
      performSearch(term);
    }
    navigate('/search');
  };

  return (
    <div className="flex flex-col w-full">
      {/* ============ HERO ============ */}
      <section className="relative text-center pt-16 md:pt-24 pb-14 md:pb-20 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[46rem] h-[46rem] rounded-full bg-primary-500/15 dark:bg-primary-500/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-purple-500/10 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-64 -right-40 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-[100px]"
        />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/5 border border-primary-500/20 hover:bg-primary-500/10 transition-colors"
            >
              <Sparkles size={14} />
              Introducing Bookland — now with a unified library
              <ArrowRight size={14} />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-7 font-display font-extrabold tracking-tightest text-5xl sm:text-7xl lg:text-[84px] leading-[1.02] text-ink dark:text-white">
              Every book.
              <br />
              <span className="text-gradient">Every idea.</span>
              <br />
              Found.
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 text-lg md:text-2xl font-medium text-muted dark:text-dark-muted leading-relaxed max-w-2xl mx-auto">
              Search millions of books, research papers, and articles from the
              world&apos;s open libraries — and read them right here.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 max-w-2xl mx-auto">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <SearchIcon
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Search the world's knowledge..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-base py-4 pl-13 pr-36 text-[17px] shadow-card dark:shadow-card-dark"
                    style={{ paddingLeft: '3.25rem' }}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-700 transition-all active:scale-95 shadow-button"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-5 flex justify-center">
              <SegmentedControl
                options={TYPE_OPTIONS}
                value={contentType}
                onChange={setContentTypeState}
              />
            </div>
          </Reveal>

          <Reveal delay={450}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => goToSearch()} className="btn-primary min-w-[10rem]">
                Start exploring <ArrowRight size={16} />
              </button>
              <Link to="/search" className="text-[15px] font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors px-3 py-2">
                Learn more <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          {/* Hero book collage */}
          <Reveal delay={500} className="mt-16 md:mt-20">
            <div className="relative flex items-end justify-center gap-3 sm:gap-5">
              {HERO_BOOKS.map((book, i) => (
                <button
                  key={book.gutenbergId}
                  onClick={() => navigate(`/book/gutenberg-${book.gutenbergId}`)}
                  className="group block focus:outline-none"
                  style={{ zIndex: i === 2 ? 10 : undefined }}
                >
                  <div
                    className={`relative w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-44 aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-slate-200 dark:bg-dark-raised shadow-lift ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-0 group-hover:-translate-y-2 group-hover:[animation:none] ${
                      book.tilt
                    } ${book.y}`}
                    style={
                      {
                        '--tilt': '0deg',
                        animation: `float-tilt 6s ease-in-out infinite`,
                        animationDelay: book.floatDelay,
                      } as React.CSSProperties
                    }
                  >
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
                </button>
              ))}
            </div>
            <div
              aria-hidden
              className="mx-auto mt-10 h-px w-2/3 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
            />
          </Reveal>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="py-8 md:py-10 border-y border-slate-200/70 dark:border-dark-border/70 bg-surface/60 dark:bg-dark-surface/40">
        <Reveal>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 text-sm font-semibold text-muted dark:text-dark-muted">
            <span className="text-[13px] uppercase tracking-widest">
              Powered by open knowledge
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <span className="hover:text-ink dark:hover:text-white transition-colors cursor-default">Open Library</span>
              <span className="hover:text-ink dark:hover:text-white transition-colors cursor-default">Project Gutenberg</span>
              <span className="hover:text-ink dark:hover:text-white transition-colors cursor-default">Internet Archive</span>
              <span className="hover:text-ink dark:hover:text-white transition-colors cursor-default">Wikisource</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FEATURE GRID ============ */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="text-center font-display font-extrabold tracking-tightest text-4xl sm:text-6xl text-ink dark:text-white">
              Why Bookland
            </h2>
            <p className="mt-4 text-center text-lg md:text-xl font-medium text-muted dark:text-dark-muted max-w-xl mx-auto">
              A digital library infrastructure designed the way reading should feel.
            </p>
          </Reveal>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80}>
                <div className="group h-full rounded-2xl md:rounded-3xl bg-surface dark:bg-dark-surface border border-slate-200/70 dark:border-dark-border/70 p-6 md:p-8 shadow-soft hover:shadow-card dark:hover:shadow-card-dark hover:-translate-y-1 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display font-bold text-xl text-ink dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted dark:text-dark-muted">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOWCASE: SEARCH ============ */}
      <section className="py-20 md:py-28 bg-surface dark:bg-dark-surface border-y border-slate-200/70 dark:border-dark-border/70 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="text-center lg:text-left">
              <span className="chip bg-primary-500/10 text-primary-600 dark:text-primary-400">Search</span>
              <h2 className="mt-4 font-display font-extrabold tracking-tightest text-4xl sm:text-5xl text-ink dark:text-white leading-[1.05]">
                The world&apos;s knowledge,
                <br />
                one search away.
              </h2>
              <p className="mt-5 text-lg text-muted dark:text-dark-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Typing is all it takes. Bookland surfaces the perfect title from millions
                of records — instantly, with results cached for the next time.
              </p>
              <button
                onClick={() => goToSearch()}
                className="mt-7 btn-secondary"
              >
                Try it now <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 bg-gradient-to-tr from-primary-500/20 to-purple-500/20 blur-3xl rounded-full"
              />
              <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-dark-raised border border-slate-200/70 dark:border-dark-border/70 shadow-card dark:shadow-card-dark p-5 md:p-6">
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-medium text-muted">
                    bookland.app/search
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-surface rounded-full px-4 py-2.5 mb-4">
                  <SearchIcon size={16} className="text-primary-600" />
                  <span className="text-sm font-medium text-ink dark:text-white">
                    pride and prejudice
                  </span>
                </div>
                <div className="space-y-2.5">
                  {TRENDING.map((book) => (
                    <button
                      key={book.gutenbergId}
                      onClick={() => navigate(`/book/gutenberg-${book.gutenbergId}`)}
                      className="w-full flex items-center gap-3 text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors group"
                    >
                      <div className="w-9 aspect-[2/3] rounded-md overflow-hidden bg-slate-200 dark:bg-dark-raised shrink-0">
                        <img
                          src={gutenbergCover(book.gutenbergId)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {book.title}
                        </p>
                        <p className="text-xs font-medium text-muted truncate">{book.author}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted shrink-0">{book.reads}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SHOWCASE: READER ============ */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 bg-gradient-to-tr from-amber-500/15 to-primary-500/20 blur-3xl rounded-full"
              />
              <div className="relative rounded-2xl md:rounded-3xl bg-surface dark:bg-dark-surface border border-slate-200/70 dark:border-dark-border/70 shadow-card dark:shadow-card-dark overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-b from-primary-50 to-white dark:from-dark-surface dark:to-dark-surface p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="chip bg-primary-600 text-white">Now reading</span>
                    <span className="text-xs font-semibold text-muted">Chapter 1 · 12%</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-11/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-10/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-8/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-11/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-6/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                    <div className="h-2.5 w-9/12 rounded-full bg-slate-200 dark:bg-dark-raised" />
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-dark-raised">
                      <div className="h-1.5 w-1/5 rounded-full bg-primary-600" />
                    </div>
                    <BookOpen size={16} className="text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="order-1 lg:order-2">
            <div className="text-center lg:text-left">
              <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-400">Read</span>
              <h2 className="mt-4 font-display font-extrabold tracking-tightest text-4xl sm:text-5xl text-ink dark:text-white leading-[1.05]">
                Read everything.
                <br />
                Distraction-free.
              </h2>
              <p className="mt-5 text-lg text-muted dark:text-dark-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                A reader built for focus — clean typography, adjustable layout, and
                seamless chapters. Your bookshelf follows you across every device.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button onClick={() => goToSearch('Frankenstein')} className="btn-primary min-w-[10rem]">
                  Start reading <ArrowRight size={16} />
                </button>
                <button onClick={() => goToSearch()} className="btn-secondary min-w-[10rem]">
                  Browse library
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-20 md:py-24 relative overflow-hidden bg-ink dark:bg-white text-white dark:text-ink">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="text-center font-display font-extrabold tracking-tightest text-3xl sm:text-5xl">
              The numbers behind the magic
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90} className="text-center">
                <stat.icon
                  size={26}
                  className="mx-auto text-primary-400 dark:text-primary-500"
                />
                <p className="mt-3 font-display font-extrabold tracking-tighter text-4xl md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-white/60 dark:text-ink/60">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUOTE ============ */}
      <section className="py-20 md:py-28">
        <Reveal>
          <figure className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <Quote className="mx-auto text-primary-500/30" size={44} />
            <blockquote className="mt-6 font-display font-bold tracking-tight text-2xl md:text-4xl leading-snug text-ink dark:text-white">
              &ldquo;Bookland is the closest thing to a magical library on the
              internet. I type a thought, and the right book appears.&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-sm font-semibold text-muted dark:text-dark-muted">
              — A Bookland reader
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ============ CLASSICS ============ */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display font-bold tracking-tight text-2xl md:text-3xl text-ink dark:text-white">
                  Start reading tonight
                </h2>
                <p className="text-sm font-medium text-muted dark:text-dark-muted mt-1">
                  Free classics, ready to read.
                </p>
              </div>
              <button
                onClick={() => goToSearch()}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
              >
                Browse all <ArrowUpRight size={15} />
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-5">
            {FEATURED.map((book, i) => (
              <Reveal key={book.gutenbergId} delay={i * 60}>
                <button
                  onClick={() => navigate(`/book/gutenberg-${book.gutenbergId}`)}
                  className="group w-full text-left"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-dark-raised shadow-soft group-hover:shadow-lift group-hover:-translate-y-1.5 transition-all duration-300">
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
                  <p className="mt-2 text-[13px] font-semibold text-ink dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {book.title}
                  </p>
                  <p className="text-xs font-medium text-muted dark:text-dark-muted truncate">
                    {book.author}
                  </p>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="pb-20 md:pb-28 px-5 sm:px-8">
        <Reveal>
          <div className="relative max-w-5xl mx-auto rounded-3xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-purple-600 px-6 py-16 md:py-24 text-center text-white shadow-lift">
            <div
              aria-hidden
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 40%)',
              }}
            />
            <div className="relative">
              <h2 className="font-display font-extrabold tracking-tightest text-4xl md:text-6xl leading-[1.05]">
                Your next chapter
                <br />
                starts now.
              </h2>
              <p className="mt-5 text-lg md:text-xl font-medium text-white/85 max-w-lg mx-auto">
                Millions of stories are waiting. Explore the library — free, forever.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => goToSearch()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-primary-700 px-7 py-3.5 text-sm font-semibold shadow-button hover:bg-slate-50 transition-all active:scale-[0.97]"
                >
                  Start exploring <ArrowRight size={16} />
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-[0.97]"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
