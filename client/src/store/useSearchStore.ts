import { create } from 'zustand';

interface Book {
  id: string;
  isbn_13: string;
  title: string;
  authors: string[];
  cover_url?: string;
  published_year?: number;
}

interface SearchState {
  searchQuery: string;
  results: Book[];
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  results: [],
  isLoading: false,
  error: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  performSearch: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      set({ results: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'An error occurred during search', isLoading: false });
    }
  },
}));
