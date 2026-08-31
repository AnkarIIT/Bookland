const OPENLIBRARY_API = 'https://openlibrary.org/search.json';
const GUTENBERG_API = 'https://gutendex.com/books/';
const INTERNET_ARCHIVE_API = 'https://archive.org/services/search/v1/scrape';
const DIGITAL_LIBRARY_INDIA_API = 'https://archive.org/services/search/v1/scrape';
const PERSEUS_API = 'https://www.perseus.tufts.edu/hopper/search';
const HATHITRUST_API = 'https://catalog.hathitrust.org/api/volumes';
const EUROPEANA_API = 'https://api.europeana.eu/record';
const MANYBOOKS_API = 'https://manybooks.net/api/books';
const OPENSTAX_API = 'https://openstax.org/api/v1';
const LIBRETEXTS_API = 'https://libretexts.org/api/v1';
const DOAB_API = 'https://doab.org/api';
const SCIELO_API = 'https://scielo.org/api/v1';
const PROJECT_MUSE_API = 'https://muse.jhu.edu/api';
const JSTOR_API = 'https://www.jstor.org/api';
const WDWORLDSCIENCE_API = 'https://worldwidescience.org/search';

// Combined search result type
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

// Search ALL sources
export const allSources = {
  search: async (query: string, limit = 10): Promise<CombinedBookResult[]> => {
    const sources = [
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
    
    const results: CombinedBookResult[] = [];
    
    for (const source of sources) {
      try {
        const sourceResults = await source.fn();
        sourceResults.forEach(r => r.source = source.name);
        results.push(...sourceResults);
      } catch (e) {
        console.error(`Error fetching from ${source.name}:`, e);
      }
    }
    
    return results.slice(0, limit);
  },
  
  // Individual source search functions
  searchOpenLibrary: async (query: string): Promise<CombinedBookResult[]> => {
    const response = await fetch(`${OPENLIBRARY_API}?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();
    
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
  },
  
  searchGutenberg: async (query: string): Promise<CombinedBookResult[]> => {
    const response = await fetch(`${GUTENBERG_API}?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    return (data.results || []).map((book: any) => ({
      id: `gutenberg-${book.id}`,
      title: book.title,
      authors: book.authors?.map((a: any) => a.name) || [],
      description: '',
      published_year: new Date(book.release_date).getFullYear(),
      publisher: 'Project Gutenberg',
      language: book.language,
      cover_url: book.imagery?.find((i: any) => i.type === 'cover')?.url,
      pdf_url: `https://www.gutenberg.org/ebooks/${book.id}.pdf`,
      url: `https://www.gutenberg.org/ebooks/${book.id}`,
      source: '',
      formatted_citation: `${book.authors?.map((a: any) => a.name).join(', ') || 'Unknown'}. ${book.title}. Project Gutenberg, ${new Date(book.release_date).getFullYear}.`
    }));
  },
  
  searchInternetArchive: async (query: string): Promise<CombinedBookResult[]> => {
    const response = await fetch(`${INTERNET_ARCHIVE_API}?q=${encodeURIComponent(query)}&collection=books&pageSize=10&fields=title,creator,description,date,publisher,identifier,languages`);
    const data = await response.json();
    
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
  },
  
  searchDLI: async (query: string): Promise<CombinedBookResult[]> => {
    // Digital Library of India via Archive.org
    const response = await fetch(`${DIGITAL_LIBRARY_INDIA_API}?collection=digital-library-of-india&q=${encodeURIComponent(query)}&pageSize=10&fields=title,creator,description,date,publisher,identifier,languages`);
    const data = await response.json();
    
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
  },
  
  // Add more search functions for other sources...
};