const GUTENDEX_URL = 'https://gutendex.com/books';
const FETCH_TIMEOUT_MS = 15000;

const fetchJson = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Gutenberg API responded with status: ${response.status}`);
  }
  return response.json();
};

const getTextUrl = async (id: number, preferred: string | null) => {
  if (preferred) return preferred;
  const candidates = [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
  ];
  for (const url of candidates) {
    const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) }).catch(() => null);
    if (head && head.ok) return url;
  }
  return candidates[0];
};

const fetchText = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) {
    throw new Error(`Gutenberg text responded with status: ${response.status}`);
  }
  return response.text();
};

const extractBookText = (raw: string): string => {
  let text = raw;
  const startMatch = text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n?/i);
  const endMatch = text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n?/i);

  if (startMatch && endMatch) {
    text = text.slice(startMatch.index! + startMatch[0].length, endMatch.index);
  }

  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
};

export const gutenberg = {
  search: async (q: string) => {
    const data: any = await fetchJson(`${GUTENDEX_URL}?search=${encodeURIComponent(q)}&page=1`);
    return data.results || [];
  },
  getById: async (id: number) => {
    const data: any = await fetchJson(`${GUTENDEX_URL}/${id}`);
    return data;
  },
  getCoverUrl: (book: any): string => {
    const imageFormat = book.formats && book.formats['image/jpeg'];
    if (imageFormat) return imageFormat;
    return `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;
  },
  getPlainTextUrl: async (book: any): Promise<string> => {
    const preferred =
      (book.formats && book.formats['text/plain; charset=utf-8']) ||
      (book.formats && book.formats['text/plain']) ||
      null;
    return getTextUrl(book.id, preferred);
  },
  fetchText,
  extractBookText,
};