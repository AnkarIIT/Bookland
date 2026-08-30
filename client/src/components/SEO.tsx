import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Bookland';
const SITE_URL = 'https://bookland.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object | object[];
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

export function SEO({
  title,
  description = 'Search millions of books, research papers, and articles from the world\'s open libraries — and read them right here.',
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  nofollow = false,
  structuredData,
  article,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const robots = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  const jsonLd = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];

  if (!structuredData && title && canonical?.startsWith('/book/')) {
    // Will be populated by BookDetail page
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bookland" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime || ''} />
          <meta property="article:modified_time" content={article.modifiedTime || ''} />
          {article.authors?.map((author) => (
            <meta key={author} property="article:author" content={author} />
          ))}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {jsonLd.length > 0 && jsonLd.map((data, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function getBookSchema(book: {
  title: string;
  authors?: string[];
  isbn13?: string;
  publishedYear?: number;
  description?: string;
  coverUrl?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  isFree?: boolean;
  readUrl?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: book.authors?.map((name) => ({ '@type': 'Person', name })) || [],
    datePublished: book.publishedYear?.toString(),
    description: book.description,
    image: book.coverUrl,
    publisher: book.publisher ? { '@type': 'Organization', name: book.publisher } : undefined,
    numberOfPages: book.pageCount,
    inLanguage: book.language,
    isbn: book.isbn13,
    url: book.readUrl,
  };

  if (book.isFree) {
    schema.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: book.readUrl,
    };
  }

  return schema;
}

export function getSearchResultsSchema(query: string, results: Array<{ title: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: results.map((result, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Book',
          name: result.title,
          url: result.url,
        },
      })),
    },
  };
}