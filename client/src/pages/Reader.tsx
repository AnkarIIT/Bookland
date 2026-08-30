import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Minus, Plus, AlertTriangle, ExternalLink } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { ArchiveReadResponse, ReadResponse } from '../types';
import { SEO, getBreadcrumbSchema } from '../components/SEO';

type ReadingTheme = 'light' | 'sepia' | 'dark';

const ReaderPage: React.FC = () => {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(19);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setContent(null);
    setEmbedUrl(null);

    const load = async () => {
      try {
        if (kind === 'gutenberg') {
          const data = await apiFetch<ReadResponse>(`/api/read/gutenberg/${id}`);
          if (cancelled) return;
          setContent(data.content);
          setTitle(data.title);
        } else if (kind === 'archive') {
          const data = await apiFetch<ArchiveReadResponse>(`/api/read/archive/${id}`);
          if (cancelled) return;
          setEmbedUrl(data.embed_url);
          setTitle(data.title || id || 'Book');
        } else {
          throw new Error('Unsupported reading source');
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load book content');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  const paragraphs = useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n{2,}/)
      .map((p) => p.replace(/\n/g, ' ').trim())
      .filter(Boolean);
  }, [content]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    setProgress(Math.round((el.scrollTop / max) * 100));
  };

  const themeStyles: Record<ReadingTheme, { bg: string; text: string; header: string; accent: string }> = {
    light: { bg: 'bg-[#fafafa]', text: 'text-ink', header: 'bg-white/80 backdrop-blur-2xl border-slate-200', accent: 'text-muted hover:text-ink' },
    sepia: { bg: 'bg-[#f6efe3]', text: 'text-[#4a3b26]', header: 'bg-[#efe4cc]/80 backdrop-blur-2xl border-[#e0d2b2]', accent: 'text-[#8a7956] hover:text-[#4a3b26]' },
    dark: { bg: 'bg-[#111111]', text: 'text-slate-200', header: 'bg-black/70 backdrop-blur-2xl border-dark-border', accent: 'text-dark-muted hover:text-white' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 size={40} className="animate-spin text-primary-600" />
          <p className="font-semibold">Opening the book...</p>
        </div>
      </div>
    );
  }

  if (error || (!content && !embedUrl)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
          <AlertTriangle size={40} />
        </div>
        <h3 className="text-2xl font-display font-extrabold text-ink dark:text-white mb-3">Could not open this book</h3>
        <p className="text-muted dark:text-dark-muted font-medium text-lg leading-relaxed max-w-md mb-8">{error}</p>
        <Link
          to="/search"
          className="btn-secondary"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const styles = themeStyles[readingTheme];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search' },
    { name: title, url: '' },
  ];

  return (
    <div className={`min-h-[80vh] flex flex-col ${styles.bg} rounded-3xl border border-slate-200 dark:border-dark-border overflow-hidden`}>
      <SEO
        title={title}
        description={`Read ${title} on Bookland — free, distraction-free reading experience.`}
        canonical={`/read/${kind}/${id}`}
        noindex={true}
        structuredData={getBreadcrumbSchema(breadcrumbs)}
      />
      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-primary-600 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Toolbar */}
      <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 px-4 md:px-8 py-3 border-b ${styles.header}`}>
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/search"
            className={`p-2 rounded-xl transition-all active:scale-90 ${styles.accent}`}
            title="Back to search"
            aria-label="Back to search"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${styles.text}`}>{title}</p>
            <p className="text-xs font-medium opacity-60">{kind === 'gutenberg' ? 'Project Gutenberg' : 'Open Library / archive.org'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {kind === 'gutenberg' && (
            <>
              <div className={`flex items-center gap-1 rounded-xl border px-1 py-1 ${styles.text}`}>
                <button
                  onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Decrease font size"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xs font-bold w-8 text-center">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(28, s + 1))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Increase font size"
                >
                  <Plus size={16} />
                </button>
              </div>
            </>
          )}

          <div className={`flex items-center gap-1 rounded-xl border px-1 py-1 ${styles.text}`}>
            {(['light', 'sepia', 'dark'] as ReadingTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setReadingTheme(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  readingTheme === t ? 'bg-primary-600 text-white' : 'opacity-70 hover:opacity-100'
                }`}
                aria-label={`${t} reading theme`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reader body */}
      {kind === 'gutenberg' && content ? (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-5 md:px-16 py-10 md:py-14 ${styles.bg}`}
        >
          <div
            className="max-w-2xl mx-auto space-y-6"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            <p className={`text-sm font-semibold opacity-50 ${styles.text}`}>{paragraphs.length} passages</p>
            {paragraphs.map((para, i) => (
              <p key={i} className={`${styles.text} font-normal tracking-wide`}>
                {para}
              </p>
            ))}
            <p className="text-sm opacity-40 pt-8 text-center italic">
              End of book — public domain text from Project Gutenberg.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full h-full max-w-5xl mx-auto">
            <iframe
              src={embedUrl || undefined}
              title={title}
              className="w-full h-[75vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-elevated bg-white"
              allowFullScreen
            />
          </div>
          <a
            href={`https://archive.org/details/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <ExternalLink size={14} /> Open original on archive.org
          </a>
        </div>
      )}
    </div>
  );
};

export default ReaderPage;
