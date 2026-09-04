import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Search as SearchIcon, Loader2, ExternalLink, FolderOpen } from 'lucide-react';
import { SEO } from '../components/SEO';
import { apiFetch } from '../lib/api';
import Reveal from '../components/Reveal';

interface ResourceLink {
  name: string;
  url: string;
  note?: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  icon: string;
  links: ResourceLink[];
}

interface SourceDirectoryResponse {
  categories: ResourceCategory[];
  total_sources: number;
  total_categories: number;
}

const Sources = () => {
  const [data, setData] = useState<SourceDirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await apiFetch<SourceDirectoryResponse>('/api/sources');
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return { categories: [], total: 0 };
    const q = query.trim().toLowerCase();
    let cats = data.categories;

    if (activeCategory) {
      cats = cats.filter((c) => c.id === activeCategory);
    }

    if (q) {
      cats = cats
        .map((cat) => ({
          ...cat,
          links: cat.links.filter(
            (link) =>
              link.name.toLowerCase().includes(q) ||
              (link.note || '').toLowerCase().includes(q) ||
              cat.title.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.links.length > 0);
    }

    const total = cats.reduce((acc, c) => acc + c.links.length, 0);
    return { categories: cats, total };
  }, [data, query, activeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 size={28} className="animate-spin text-primary-600" />
          <p className="font-semibold text-sm">Loading source directory…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-lg font-semibold text-ink dark:text-white">Couldn't load the source directory.</p>
        <p className="mt-2 text-muted text-sm">{error || 'Unknown error'}</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <SEO
        title="Source Directory"
        description="Browse hundreds of the world's best free book, ebook, audiobook, comic, manga, and academic resources — organized and searchable."
        canonical="/sources"
      />

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors w-fit">
        <ArrowLeft size={15} />
        Back to Bookland
      </Link>

      <div className="mt-6 md:mt-8">
        <span className="chip bg-primary-500/10 text-primary-600 dark:text-primary-400">Free knowledge</span>
        <h1 className="mt-4 font-display font-extrabold tracking-tightest text-4xl sm:text-5xl text-ink dark:text-white">
          Source Directory
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted dark:text-dark-muted">
          A curated directory of <span className="font-semibold text-ink dark:text-white">{data.total_sources}+ free resources</span> across
          {` `}{data.total_categories} categories — ebooks, audiobooks, comics, manga, papers, manuals, and more.
          Search or browse, then jump straight to the source.
        </p>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative max-w-xl">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory(null);
            }}
            placeholder="Search all sources…"
            className="input-base pl-11 pr-4 py-2.5 w-full"
          />
        </div>
      </div>

      {/* Category chips */}
      {!query && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
              activeCategory === null
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-surface text-muted dark:text-dark-muted border-slate-200/70 dark:border-dark-border/70 hover:text-ink dark:hover:text-white'
            }`}
          >
            All ({data.total_sources})
          </button>
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-surface text-muted dark:text-dark-muted border-slate-200/70 dark:border-dark-border/70 hover:text-ink dark:hover:text-white'
              }`}
            >
              {cat.icon} {cat.title} ({cat.links.length})
            </button>
          ))}
        </div>
      )}

      {/* Results header */}
      <p className="mt-8 text-sm font-medium text-muted dark:text-dark-muted">
        {query
          ? `${filtered.total} match${filtered.total === 1 ? '' : 'es'} for "${query}"`
          : activeCategory
          ? `Showing ${filtered.total} sources`
          : `All ${filtered.total} sources`}
      </p>

      {/* Categories */}
      <div className="mt-6 space-y-12">
        {filtered.categories.length === 0 && (
          <div className="text-center py-16 text-muted">
            <FolderOpen size={32} className="mx-auto text-muted/40" />
            <p className="mt-3 font-semibold">No sources found{query ? ` for "${query}"` : ''}.</p>
          </div>
        )}

        {filtered.categories.map((cat, i) => (
          <Reveal key={cat.id} delay={Math.min(i * 40, 200)}>
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 text-base shrink-0">
                  {cat.icon}
                </span>
                <h2 className="font-display font-bold text-xl text-ink dark:text-white">
                  {cat.title}
                </h2>
                <span className="text-xs font-semibold text-muted dark:text-dark-muted bg-surface dark:bg-dark-surface border border-slate-200/70 dark:border-dark-border/70 rounded-full px-2.5 py-0.5">
                  {cat.links.length}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {cat.links.map((source) => (
                  <a
                    key={`${cat.id}-${source.name}`}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 rounded-xl bg-surface dark:bg-dark-surface border border-slate-200/70 dark:border-dark-border/70 p-3.5 hover:border-primary-500/40 hover:shadow-soft transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {source.name}
                      </span>
                      <ExternalLink size={13} className="text-muted/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {source.note && (
                      <p className="text-xs text-muted dark:text-dark-muted line-clamp-2 leading-relaxed">
                        {source.note}
                      </p>
                    )}
                    <span className="mt-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowUpRight size={11} />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Sources;
