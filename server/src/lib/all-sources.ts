const OPENLIBRARY_API = 'https://openlibrary.org/search.json';
const GUTENBERG_API = 'https://gutendex.com/books/';
const INTERNET_ARCHIVE_API = 'https://archive.org/services/search/v1/scrape';
const DIGITAL_LIBRARY_INDIA_API = 'https://archive.org/services/search/v1/scrape';
const PERSEUS_API = 'https://www.perseus.tufts.edu/hopper/search';
const HATHITRUST_API = 'https://catalog.hathitrust.org/api/volumes';
const EUROPEANA_API = 'https://api.europeana.eu/record/v2/search.json';
const MANYBOOKS_API = 'https://manybooks.net/search-api/';
const OPENSTAX_API = 'https://openstax.org/apps/cms/openstax/api/rex/v1/books';
const LIBRETEXTS_API = 'https://www.libretexts.org/api/';
const DOAB_API = 'https://directory.doabooks.org/rest/search';
const SCIELO_API = 'https://index.scielo.org/api/v1/scielo';

const FETCH_TIMEOUT_MS = 8000;

interface CombinedBookResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  published_year?: number;
  publisher?: string;
  page_count?: number;
  language?: string;
  cover_url?: string;
  source: string;
  url: string;
  pdf_url?: string;
  ebook_access?: string;
  formatted_citation: string;
}

const fetchJson = async (url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<any> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const searchOpenLibrary = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(
    `${OPENLIBRARY_API}?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,publisher,cover_i,isbn,ebook_access,language`
  );

  return (data.docs || []).map((doc: any) => ({
    id: `ol-${doc.key?.replace('/works/', '')}`,
    title: doc.title,
    authors: doc.author_name || [],
    description: doc.first_sentence?.value || doc.description || '',
    published_year: doc.first_publish_year,
    publisher: doc.publisher?.[0],
    page_count: doc.number_of_pages_median,
    language: doc.language?.[0]?.toUpperCase(),
    cover_url: doc.cover_i ? `https://covers.openlibrary.org/w/id/${doc.cover_i}-L` : null,
    url: `https://openlibrary.org${doc.key}`,
    pdf_url: doc.ebook_access === 'borrowable' ? `https://openlibrary.org${doc.key}/read` : null,
    source: '',
    formatted_citation: `${doc.author_name?.join(', ') || 'Unknown'}. ${doc.title}. ${doc.publisher?.[0] || ''}, ${doc.first_publish_year}.`
  }));
};

const searchGutenberg = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${GUTENBERG_API}?search=${encodeURIComponent(query)}`);

  return (data.results || []).map((book: any) => ({
    id: `gutenberg-${book.id}`,
    title: book.title,
    authors: book.authors?.map((a: any) => a.name) || [],
    description: '',
    published_year: book.release_date ? new Date(book.release_date).getFullYear() : undefined,
    publisher: 'Project Gutenberg',
    language: book.language,
    cover_url: book.imagery?.find((i: any) => i.type === 'cover')?.url,
    pdf_url: `https://www.gutenberg.org/ebooks/${book.id}.pdf`,
    url: `https://www.gutenberg.org/ebooks/${book.id}`,
    source: '',
    formatted_citation: `${book.authors?.map((a: any) => a.name).join(', ') || 'Unknown'}. ${book.title}. Project Gutenberg, ${book.release_date ? new Date(book.release_date).getFullYear() : ''}.`
  }));
};

const searchInternetArchive = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(
    `${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(query)}&collection=books&pageSize=10&fields=title,creator,description,date,publisher,identifier,languages`
  );

  return (data.docs || []).map((item: any) => ({
    id: `archive-${item.identifier}`,
    title: item.title,
    authors: item.creator ? [item.creator] : ['Unknown Creator'],
    description: item.description || '',
    published_year: item.date ? parseInt(item.date) : undefined,
    publisher: item.publisher,
    language: item.languages?.[0],
    cover_url: null,
    pdf_url: `https://archive.org/download/${item.identifier}/${item.identifier}.pdf`,
    url: `https://archive.org/details/${item.identifier}`,
    source: '',
    formatted_citation: `${item.creator || 'Unknown'}. ${item.title}. Internet Archive, ${item.date || ''}.`
  }));
};

const searchDLI = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(
    `${DIGITAL_LIBRARY_INDIA_API}?collection=digital-library-of-india&q=${encodeURIComponent(query)}&pageSize=10&fields=title,creator,description,date,publisher,identifier,languages`
  );

  return (data.docs || []).map((item: any) => ({
    id: `dli-${item.identifier}`,
    title: item.title,
    authors: item.creator ? [item.creator] : ['Unknown Author'],
    description: item.description || '',
    published_year: item.date ? parseInt(item.date) : undefined,
    publisher: item.publisher,
    language: item.languages?.[0],
    cover_url: null,
    pdf_url: `https://archive.org/download/${item.identifier}/${item.identifier}.pdf`,
    url: `https://archive.org/details/${item.identifier}`,
    source: '',
    formatted_citation: `${item.creator || 'Unknown'}. ${item.title}. Digital Library of India, ${item.date || ''}.`
  }));
};

const searchPerseus = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${PERSEUS_API}?q=${encodeURIComponent(query)}&lang=eng`);

  return (data.results || []).map((item: any) => ({
    id: `perseus-${item.id || item.label}`,
    title: item.title || item.label || 'Ancient Work',
    authors: item.author ? [item.author] : ['Unknown'],
    description: item.description || '',
    url: item.url || `${PERSEUS_API}?q=${encodeURIComponent(query)}`,
    source: '',
    formatted_citation: `${item.author || 'Unknown'}. ${item.title || item.label}. Perseus Digital Library.`
  }));
};

const searchHathiTrust = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${HATHITRUST_API}?htid=${encodeURIComponent(query)}`);

  const items = data?.items || [];
  return Object.values(items).map((item: any) => ({
    id: `hathi-${item.recordNumber}`,
    title: item.title || query,
    authors: item.creator ? [item.creator] : ['Unknown'],
    description: '',
    published_year: item.year,
    publisher: item.publisher,
    url: item.handle !== '' ? `https://catalog.hathitrust.org/${item.handle}` : HATHITRUST_API,
    source: '',
    formatted_citation: `${item.creator || 'Unknown'}. ${item.title || query}. HathiTrust.`
  }));
};

const searchEuropeana = async (query: string): Promise<CombinedBookResult[]> => {
  const apiKey = process.env.EUROPEANA_API_KEY || '';
  if (!apiKey) return [];

  const data = await fetchJson(
    `${EUROPEANA_API}?query=${encodeURIComponent(query)}&wskey=${apiKey}&rows=10&profile=standard`
  );

  return (data.items || []).map((item: any) => ({
    id: `europeana-${item.id}`,
    title: item.title?.[0] || query,
    authors: item.dcCreator || ['Unknown'],
    description: item.dcDescription?.[0] || '',
    publisher: item.dataProvider?.[0],
    language: item.language?.[0],
    cover_url: item.edmPreview?.[0],
    url: item.guid || EUROPEANA_API,
    source: '',
    formatted_citation: `${item.dcCreator?.[0] || 'Unknown'}. ${item.title?.[0] || query}. Europeana.`
  }));
};

const searchManyBooks = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${MANYBOOKS_API}?search=${encodeURIComponent(query)}`);

  return (data.books || data || []).map((item: any) => ({
    id: `manybooks-${item.id || item.title}`,
    title: item.title || query,
    authors: item.author ? [item.author] : ['Unknown'],
    description: item.description || '',
    url: item.url || `https://manybooks.net/search?q=${encodeURIComponent(query)}`,
    source: '',
    formatted_citation: `${item.author || 'Unknown'}. ${item.title || query}. ManyBooks.`
  }));
};

const searchOpenStax = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${OPENSTAX_API}?q=${encodeURIComponent(query)}`);

  return (data.results || data || []).map((item: any) => ({
    id: `openstax-${item.id || item.slug}`,
    title: item.title || query,
    authors: item.authors || ['OpenStax'],
    description: item.description || '',
    published_year: item.publishYear,
    publisher: 'OpenStax',
    url: item.webviewLink || item.url || 'https://openstax.org',
    pdf_url: item.pdfLink || null,
    source: '',
    formatted_citation: `OpenStax. ${item.title || query}. Rice University, ${item.publishYear || ''}.`
  }));
};

const searchLibreTexts = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${LIBRETEXTS_API}?q=${encodeURIComponent(query)}`);

  return (data.results || data || []).map((item: any) => ({
    id: `libretexts-${item.id || item.slug || item.title}`,
    title: item.title || query,
    authors: item.author ? [item.author] : ['LibreTexts'],
    description: item.description || '',
    url: item.url || `https://libretexts.org/${item.slug || ''}`,
    source: '',
    formatted_citation: `LibreTexts. ${item.title || query}.`
  }));
};

const searchDOAB = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${DOAB_API}?query=${encodeURIComponent(query)}&expand=metadata&limit=10`);

  return (data.records || []).map((item: any) => ({
    id: `doab-${item.id}`,
    title: item.title || query,
    authors: item.author || ['Unknown'],
    description: item.abstract || item.description || '',
    language: item.language,
    url: item.link || `https://directory.doabooks.org/handle/20.500.12854/${item.id}`,
    source: '',
    formatted_citation: `${(item.author || ['Unknown']).join(', ')}. ${item.title || query}. Directory of Open Access Books.`
  }));
};

const searchSciELO = async (query: string): Promise<CombinedBookResult[]> => {
  const data = await fetchJson(`${SCIELO_API}/?q=${encodeURIComponent(query)}&items=10`);

  return (data.result || []).map((item: any) => ({
    id: `scielo-${item.id}`,
    title: item.title || query,
    authors: item.creator ? [item.creator] : ['SciELO'],
    description: item.description || '',
    published_year: item.year,
    url: item.url || item.doi || 'https://www.scielo.org',
    source: '',
    formatted_citation: `${item.creator || 'Unknown'}. ${item.title || query}. SciELO, ${item.year || ''}.`
  }));
};

export const allSources = {
  search: async (query: string, limit = 10): Promise<CombinedBookResult[]> => {
    const sources: Array<{ name: string; fn: () => Promise<CombinedBookResult[]> }> = [
      { name: 'openlibrary', fn: () => searchOpenLibrary(query) },
      { name: 'gutenberg', fn: () => searchGutenberg(query) },
      { name: 'internet_archive', fn: () => searchInternetArchive(query) },
      { name: 'digital_library_india', fn: () => searchDLI(query) },
      { name: 'perseus', fn: () => searchPerseus(query) },
      { name: 'hathitrust', fn: () => searchHathiTrust(query) },
      { name: 'europeana', fn: () => searchEuropeana(query) },
      { name: 'manybooks', fn: () => searchManyBooks(query) },
      { name: 'openstax', fn: () => searchOpenStax(query) },
      { name: 'libretexts', fn: () => searchLibreTexts(query) },
      { name: 'doab', fn: () => searchDOAB(query) },
      { name: 'scielo', fn: () => searchSciELO(query) },
    ];

    const settled = await Promise.allSettled(sources.map((s) => s.fn()));

    const results: CombinedBookResult[] = [];
    settled.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        const tagged = res.value.map((r) => ({ ...r, source: sources[idx].name }));
        results.push(...tagged);
      } else {
        console.error(`Error fetching from ${sources[idx].name}:`, res.reason);
      }
    });

    return results.slice(0, limit);
  },

  searchOpenLibrary,
  searchGutenberg,
  searchInternetArchive,
  searchDLI,
  searchPerseus,
  searchHathiTrust,
  searchEuropeana,
  searchManyBooks,
  searchOpenStax,
  searchLibreTexts,
  searchDOAB,
  searchSciELO,
};