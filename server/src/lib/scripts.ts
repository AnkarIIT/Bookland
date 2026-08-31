const PERSEUS_API = 'https://www.perseus.tufts.edu/hopper/api';
const DHARMA_FLIES = 'https://dharmafly.github.io/palate/notes/';
const DIGITAL_LIBRARY_INDIA = 'https://archive.org/services/search/v1/scrape';

interface ScriptEntry {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  language: string;
  script_type: 'samskrita' | 'prakrit' | 'pali' | 'classical-chinese' | 'sanskrit' | 'arabic' | 'latin';
  date?: string;
  text_url?: string;
  pdf_url?: string;
  cover_url?: string;
  source: 'perseus' | 'dlindia' | 'gutenberg' | 'dhd';
}

interface SearchResult {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  language: string;
  date?: string;
  url: string;
  source: string;
}

// Perseus Digital Library API
async function searchPerseus(query: string, maxResults = 25): Promise<ScriptEntry[]> {
  const results: ScriptEntry[] = [];
  
  try {
    const response = await fetch(
      `https://www.perseus.tufts.edu/hopper/search?q=${encodeURIComponent(query)}&limit=${maxResults}`
    );
    
    if (!response.ok) return results;
    
    const data = await response.json();
    
    for (const item of data?.results || []) {
      results.push({
        id: `perseus-${item.id}`,
        title: item.title || item.work || 'Unknown Work',
        authors: item.author ? [item.author] : undefined,
        description: item.abstract || item.desc || '',
        language: item.language || 'unknown',
        script_type: detectScriptType(item.language || ''),
        date: item.date || undefined,
        text_url: item.url || null,
        source: 'perseus',
      });
    }
  } catch (e) {
    console.error('Perseus API error:', e);
  }
  
  return results;
}

// Digital Library of India
async function searchDLI(query: string, maxResults = 25): Promise<ScriptEntry[]> {
  const results: ScriptEntry[] = [];
  
  try {
    const response = await fetch(
      `https://archive.org/services/search/v1/scrape.json?collection=digital-library-of-india&query=${encodeURIComponent(query)}&fields=title,creator,description,date&pageSize=${maxResults}`
    );
    
    if (!response.ok) return results;
    
    const data = await response.json();
    
    for (const item of data.docs || []) {
      results.push({
        id: `dlindia-${item.identifier}`,
        title: item.title || 'Unknown Title',
        authors: item.creator ? [item.creator] : undefined,
        description: item.description || '',
        language: item.language || 'unknown',
        script_type: detectScriptType(item.language || ''),
        date: item.date || undefined,
        text_url: `https://archive.org/details/${item.identifier}`,
        pdf_url: `https://archive.org/download/${item.identifier}/${item.identifier}.pdf`,
        source: 'dlindia',
      });
    }
  } catch (e) {
    console.error('DLI API error:', e);
  }
  
  return results;
}

// Gutenberg ancient texts
async function searchGutenbergAncient(query: string, maxResults = 25): Promise<ScriptEntry[]> {
  const results: ScriptEntry[] = [];
  
  try {
    const response = await fetch(
      `https://www.gutenberg.org/query/search/simple/?search=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) return results;
    
    const text = await response.text();
    
    const entryRegex = /<tr>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<\/tr>/g;
    const matches = text.match(entryRegex) || [];
    
    for (const match of matches.slice(0, maxResults)) {
      const columns = match.match(/<td[^>]*>([^<]*)<\/td>/g) || [];
      if (columns.length >= 3) {
        const id = columns[0]?.match(/\d+/)?.[0];
        const title = columns[1]?.replace(/<[^>]*>/g, '').trim();
        const author = columns[2]?.replace(/<[^>]*>/g, '').trim();
        
        if (id && title) {
          results.push({
            id: `gutenberg-${id}`,
            title,
            authors: author ? [author] : undefined,
            language: 'latin',
            script_type: 'latin',
            text_url: `https://www.gutenberg.org/ebooks/${id}`,
            source: 'gutenberg',
          });
        }
      }
    }
  } catch (e) {
    console.error('Gutenberg API error:', e);
  }
  
  return results;
}

// DHARMA project for ancient Indian scripts
async function searchDharma(query: string, maxResults = 25): Promise<ScriptEntry[]> {
  const results: ScriptEntry[] = [];
  
  try {
    const response = await fetch(
      `https://digitalpalaeography.org/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`
    );
    
    if (!response.ok) return results;
    
    const data = await response.json();
    
    for (const item of data?.items || data || []) {
      results.push({
        id: `dhd-${item.id}`,
        title: item.title || item.name || 'Ancient Manuscript',
        authors: item.creator ? [item.creator] : ['Anonymous'],
        description: item.description || '',
        language: item.language || 'samskrita',
        script_type: item.script || 'samskrita',
        date: item.date || item.created || undefined,
        text_url: item.url || null,
        source: 'dhd',
      });
    }
  } catch (e) {
    console.error('Dharma API error:', e);
  }
  
  return results;
}

function detectScriptType(language: string): ScriptEntry['script_type'] {
  const lang = language.toLowerCase();
  
  if (['sanskrit', 'samskrita', 'prakrit', 'pali'].includes(lang)) return 'samskrita';
  if (['classical chinese', 'chinese', 'sanskrit'].some(s => lang.includes(s))) return 'classical-chinese';
  if (lang.includes('arabic')) return 'arabic';
  if (lang.includes('latin')) return 'latin';
  
  return 'latin';
}

function mapToScript(entry: ScriptEntry, source: string): any {
  return {
    id: entry.id,
    title: entry.title,
    authors: entry.authors || [],
    description: entry.description || '',
    language: entry.language,
    script_type: entry.script_type,
    date: entry.date || null,
    text_url: entry.text_url || null,
    pdf_url: entry.pdf_url || null,
    cover_url: entry.cover_url || null,
    source,
    readable: !!entry.text_url,
  };
}

export const ancientScripts = {
  search: async (query: string, type?: 'all' | 'perseus' | 'dlindia' | 'gutenberg' | 'dhd'): Promise<any[]> => {
    const results: any[] = [];
    
    if (type === 'all' || type === 'perseus') {
      const ps = await searchPerseus(query);
      results.push(...ps.map(r => mapToScript(r, 'perseus')));
    }
    
    if (type === 'all' || type === 'dlindia') {
      const dli = await searchDLI(query);
      results.push(...dli.map(r => mapToScript(r, 'dlindia')));
    }
    
    if (type === 'all' || type === 'gutenberg') {
      const gb = await searchGutenbergAncient(query);
      results.push(...gb.map(r => mapToScript(r, 'gutenberg')));
    }
    
    if (type === 'all' || type === 'dhd') {
      const dharma = await searchDharma(query);
      results.push(...dharma.map(r => mapToScript(r, 'dhd')));
    }
    
    return results.slice(0, 50);
  },
  
  getById: async (id: string): Promise<any | null> => {
    if (id.startsWith('perseus-')) {
      const results = await searchPerseus(id.replace('perseus-', ''), 1);
      if (results.length > 0) return mapToScript(results[0], 'perseus');
    }
    
    if (id.startsWith('dlindia-')) {
      const identifier = id.replace('dlindia-', '');
      try {
        const response = await fetch(
          `https://archive.org/services/search/v1/scrape.json?query=${identifier}&fields=title,creator,description,date,languages&pageSize=1`
        );
        if (response.ok) {
          const data = await response.json();
          const item = data.docs?.[0];
          if (item) {
            return mapToScript({
              id,
              title: item.title || 'Unknown',
              authors: item.creator ? [item.creator] : undefined,
              language: item.languages?.[0] || 'unknown',
              script_type: detectScriptType(item.languages?.[0] || 'unknown'),
              text_url: `https://archive.org/details/${item.identifier}`,
              pdf_url: `https://archive.org/download/${item.identifier}/${item.identifier}.pdf`,
              source: 'dlindia',
            }, 'dlindia');
          }
        }
      } catch (e) {
        console.error('DLI fetch error:', e);
      }
    }
    
    return null;
  },
  
  browseByLanguage: async (language: string, limit = 25): Promise<any[]> => {
    const langMap: Record<string, string[]> = {
      sanskrit: ['perseus', 'dlindia', 'dhd'],
      pali: ['gutenberg', 'perseus'],
      arabic: ['gutenberg'],
      'classical chinese': ['perseus'],
    };
    
    const sources = langMap[language.toLowerCase()] || ['gutenberg'];
    const results: any[] = [];
    
    for (const source of sources) {
      const type = sources.length === 1 ? 'all' : 'dhd';
      const srcResults = await ancientScripts.search(language, type as any);
      results.push(...srcResults);
    }
    
    return results.slice(0, limit);
  },
};

export type { ScriptEntry, SearchResult };