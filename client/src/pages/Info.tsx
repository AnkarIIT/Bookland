import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Mail } from 'lucide-react';
import { SEO } from '../components/SEO';

type InfoKind = 'about' | 'privacy' | 'terms';

const CONTENT: Record<InfoKind, { title: string; description: string; intro: string; sections: { heading: string; body: string[] }[] }> = {
  about: {
    title: 'About Bookland',
    description: 'Bookland is a free digital library — search millions of books, research papers, and articles from the world\'s open libraries and read them right here.',
    intro:
      'Bookland is a digital library built on public knowledge. We bring together millions of records from open catalogs and public-domain archives so that anyone, anywhere, can search for a title and start reading within seconds — no accounts, no paywalls.',
    sections: [
      {
        heading: 'Our mission',
        body: [
          'Every book ever written should be findable by anyone with a connection. We started Bookland to make the world\'s open knowledge easy to search and effortless to read, in one calm place.',
          'Behind the scenes we index public catalogs and public-domain text archives, cache results for near-instant replies, and present it all with a reading experience tuned for focus — not for advertising.',
        ],
      },
      {
        heading: 'Powered by open knowledge',
        body: [
          'Bookland surfaces records from Open Library, Project Gutenberg, the Internet Archive, and Wikisource. Every book link goes back to its original source, and all content remains covered by its original license.',
        ],
      },
      {
        heading: 'Free, forever',
        body: [
          'Searching and reading on Bookland is free. There are no subscriptions, no ads, and no tracking-for-profit. We keep the experience simple and open because the public library of the future should be exactly that.',
        ],
      },
      {
        heading: 'Contact',
        body: [
          'Questions, corrections, or source requests? Reach us at hello@bookland.app and we\'ll get back to you.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How Bookland handles your data — we collect the minimum, keep it local, and never sell your information.',
    intro:
      'Your privacy matters. Bookland collects as little as possible, keeps account data yours, and never sells or rents personal information to anyone.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'If you browse without an account, we do not require personal information. Your search queries are handled by your browser and our search endpoint, and your theme and preferences are stored locally on your device.',
          'If you create an account, we store your name and email (hashed where possible) so we can keep your saved books and reading position across devices.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'Account data is used only to power your personal features — saved books, reading progress, and authentication. We never use your data for advertising profiles or sell it to third parties.',
        ],
      },
      {
        heading: 'Cookies & local storage',
        body: [
          'We use local storage for your theme preference and session tokens. These stay on your device. We do not use invasive third-party advertising or social-tracking cookies.',
        ],
      },
      {
        heading: 'Third-party sources',
        body: [
          'Book covers and book content are served by open partners (Open Library, Project Gutenberg, Internet Archive, Wikisource). When you load a book or cover, those services see a standard request, just like any website you visit.',
        ],
      },
      {
        heading: 'Your control',
        body: [
          'You can delete your account at any time, which removes your stored data. Clearing your browser\'s site data also removes local preferences.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description: 'The simple rules for using Bookland.',
    intro:
      'Using Bookland means you agree to these simple terms. They exist to keep the service open, safe, and useful for everyone.',
    sections: [
      {
        heading: 'Using the service',
        body: [
          'Bookland provides search and reading tools over public-domain and openly licensed content. You are welcome to search, read, and share links. You may not scrape or bulk-download the service in ways that disrupt it, nor use it for unlawful purposes.',
        ],
      },
      {
        heading: 'Accounts',
        body: [
          'Accounts let you save books and sync reading progress. Keep your credentials safe — you are responsible for activity on your account. You may delete your account at any time.',
        ],
      },
      {
        heading: 'Content & licensing',
        body: [
          'We are a search and reading surface over third-party open archives. Original works are covered by their own licenses (most public-domain classics are free to read worldwide). Where a work is restricted in your region, please respect its source license.',
        ],
      },
      {
        heading: 'Availability',
        body: [
          'The service is provided "as is" without warranties. While we aim for reliable, fast access, we do not guarantee uninterrupted availability and are not liable for indirect or consequential damage arising from its use.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'We may update these terms as the service evolves. Material changes will be reflected here, and continued use after changes means you accept the updated terms.',
        ],
      },
    ],
  },
};

const Info: React.FC<{ kind: InfoKind }> = ({ kind }) => {
  const { title, description, intro, sections } = CONTENT[kind];

  return (
    <div className="flex flex-col w-full">
      <SEO title={title} description={description} canonical={`/${kind}`} />

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors w-fit">
        <ArrowUpRight size={15} />
        Back to Bookland
      </Link>

      <div className="mt-6 md:mt-8 flex items-start gap-4">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0">
          <BookOpen size={22} />
        </span>
        <div>
          <h1 className="font-display font-extrabold tracking-tightest text-4xl sm:text-5xl text-ink dark:text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted dark:text-dark-muted">
            {intro}
          </p>
        </div>
      </div>

      <div className="mt-10 md:mt-12 space-y-8">
        {sections.map((section, i) => (
          <section key={section.heading} className="grid md:grid-cols-[200px_1fr] gap-2 md:gap-8 border-t border-slate-200/70 dark:border-dark-border/70 pt-8">
            <h2 className="font-display font-bold text-lg text-ink dark:text-white">
              <span className="mr-2 text-primary-500">{String(i + 1).padStart(2, '0')}</span>
              {section.heading}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-relaxed text-muted dark:text-dark-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-surface dark:bg-dark-surface border border-slate-200/70 dark:border-dark-border/70 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Mail size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
        <p className="text-sm font-medium text-muted dark:text-dark-muted">
          Questions about this page? Email{' '}
          <a href="mailto:hello@bookland.app" className="text-primary-600 hover:text-primary-700 transition-colors">
            hello@bookland.app
          </a>
        </p>
      </div>
    </div>
  );
};

export default Info;