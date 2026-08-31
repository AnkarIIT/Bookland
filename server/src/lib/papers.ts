const ARXIV_API = 'http://export.arxiv.org/api/query';
const CROSSREF_API = 'https://api.crossref.org/works';

interface ArxivEntry {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  categories: string[];
  pdf_url?: string;
  cover_url?: string;
}

interface CrossrefEntry {
  doi: string;
  title: string;
  authors: string[];
  abstract?: string;
  published_year?: number;
  publisher?: string;
  journal?: string;
  pages?: string;
  pdf_url?: string;
  license?: any[];
}

async function searchArxiv(query: string, maxResults = 25): Promise<ArxivEntry[]> {
  const url = `${ARXIV_API}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`arXiv API error: ${response.status}`);
  }
  
  const text = await response.text();
  const entries: ArxivEntry[] = [];
  
  const entryRegex = /<entry[^>]*>[\s\S]*?<\/entry>/g;
  const matches = text.match(entryRegex) || [];
  
  for (const match of matches) {
    try {
      const idMatch = match.match(/<id[^>]*>([^<]*)<\/id>/);
      const titleMatch = match.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const summaryMatch = match.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
      const publishedMatch = match.match(/<published[^>]*>([^<]*)<\/published>/);
      
      const id = idMatch ? idMatch[1].replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '') : '';
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
      const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
      const published = publishedMatch ? publishedMatch[1] : '';
      
      if (!id || !title) continue;
      
      const authorNames: string[] = [];
      const authorRegex = /<author>[\s\S]*?<name[^>]*>([^<]*)<\/name>[\s\S]*?<\/author>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(match)) !== null) {
        authorNames.push(authorMatch[1]);
      }
      
      const categories: string[] = [];
      const categoryRegex = /<category[^>]*term="([^"]*)"/g;
      while ((authorMatch = categoryRegex.exec(match)) !== null) {
        categories.push(authorMatch[1]);
      }
      
      const pdfLinkMatch = match.match(/<link[^>]*title="pdf"[^>]*href="([^"]*)"/);
      const pdfLink = pdfLinkMatch ? pdfLinkMatch[1] : '';
      
      entries.push({
        id,
        title,
        authors: authorNames,
        abstract: summary,
        published,
        categories,
        pdf_url: pdfLink ? pdfLink.replace('/abs/', '/pdf/') : undefined,
        cover_url: undefined,
      });
    } catch (e) {
      // Skip malformed entry
    }
  }
  
  return entries;
}

async function searchCrossref(query: string, maxResults = 25): Promise<CrossrefEntry[]> {
  const url = `${CROSSREF_API}?query=${encodeURIComponent(query)}&rows=${maxResults}&mailto=hello@bookland.app`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CrossRef API error: ${response.status}`);
  }
  
  const data = await response.json() as any;
  const items = data.message?.items || [];
  
  return items.map((item: any) => ({
    doi: item.DOI || '',
    title: Array.isArray(item.title) ? item.title[0] : item.title || '',
    authors: (item.author || []).map((a: any) => 
      `${a.given || ''} ${a.family || ''}`.trim()
    ).filter(Boolean),
    abstract: item.abstract || null,
    published_year: item.published?.['date-parts']?.[0]?.[0] || item.created?.['date-parts']?.[0]?.[0] || null,
    publisher: item.publisher || null,
    journal: item['container-title'],
    pages: item.page || null,
    pdf_url: null,
    license: item.license || [],
  }));
}

function mapToPaper(entry: ArxivEntry | CrossrefEntry, source: 'arxiv' | 'crossref'): any {
  const arxivEntry = entry as ArxivEntry;
  const crossrefEntry = entry as CrossrefEntry;
  
  return {
    id: source === 'arxiv' ? `arxiv-${arxivEntry.id}` : `doi-${crossrefEntry.doi}`,
    arxiv_id: source === 'arxiv' ? arxivEntry.id : null,
    doi: source === 'crossref' ? crossrefEntry.doi : null,
    title: entry.title,
    authors: entry.authors,
    published_year: source === 'arxiv' ? parseInt(arxivEntry.published) : crossrefEntry.published_year || null,
    journal: crossrefEntry.journal || null,
    publisher: crossrefEntry.publisher || null,
    pages: crossrefEntry.pages || null,
    abstract: arxivEntry.abstract || crossrefEntry.abstract || null,
    categories: arxivEntry.categories || null,
    pdf_url: arxivEntry.pdf_url || crossrefEntry.pdf_url || null,
    cover_url: arxivEntry.cover_url || null,
    license: crossrefEntry.license || [],
    source,
    readable: source === 'arxiv' || crossrefEntry.license?.some((l: any) => 
      l.URL?.toLowerCase()?.includes('open') || l?.URL?.toLowerCase()?.includes('pdf')
    ) || false,
  };
}

export const papers = {
  search: async (query: string, type: 'all' | 'arxiv' | 'crossref' = 'all', maxResults = 50): Promise<any[]> => {
    const results: any[] = [];
    
    if (type === 'all' || type === 'arxiv') {
      try {
        const arxivResults = await searchArxiv(query, maxResults);
        results.push(...arxivResults.map(r => mapToPaper(r, 'arxiv')));
      } catch (e) {
        console.error('ArXiv search failed:', e);
      }
    }
    
    if (type === 'all' || type === 'crossref') {
      try {
        const crossrefResults = await searchCrossref(query, maxResults);
        results.push(...crossrefResults.map(r => mapToPaper(r, 'crossref')));
      } catch (e) {
        console.error('CrossRef search failed:', e);
      }
    }
    
    return results.slice(0, maxResults);
  },
  
  getById: async (id: string): Promise<any | null> => {
    if (id.startsWith('arxiv-')) {
      const arxivId = id.replace('arxiv-', '');
      const results = await searchArxiv(arxivId, 1);
      if (results.length > 0) {
        return mapToPaper(results[0], 'arxiv');
      }
    }
    
    if (id.startsWith('doi-')) {
      const doi = id.replace('doi-', '');
      try {
        const url = `https://api.crossref.org/works/${doi}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json() as any;
          const item = data.message;
          if (item) {
            return mapToPaper({
              doi: item.DOI || '',
              title: Array.isArray(item.title) ? item.title[0] : item.title || '',
              authors: (item.author || []).map((a: any) => 
                `${a.given || ''} ${a.family || ''}`.trim()
              ),
              abstract: item.abstract || null,
              published_year: item.published?.['date-points']?.[0]?.[0] || null,
              publisher: item.publisher || null,
              journal: item['container-title'],
              pages: item.page || null,
              pdf_url: null,
              license: item.license || [],
            }, 'crossref');
          }
        }
      } catch (e) {
        console.error('DOI fetch failed:', e);
      }
    }
    
    return null;
  },
};

export type { ArxivEntry, CrossrefEntry };