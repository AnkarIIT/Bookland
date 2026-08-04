import { create } from 'zustand';
import type { Book } from '../types';

export type ContentType = 'all' | 'book' | 'paper' | 'article';

interface SearchState {
  searchQuery: string;
  contentType: ContentType;
  results: Book[];
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setContentType: (type: ContentType) => void;
  performSearch: (query: string) => Promise<void>;
}

let activeController: AbortController | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  contentType: 'all',
  results: [],
  isLoading: false,
  error: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setContentType: (type) => set({ contentType: type, results: [], error: null }),

  performSearch: async (query) => {
    const { contentType } = get();

    // Papers & articles aren't indexed yet — show an honest empty state
    if (contentType === 'paper' || contentType === 'article') {
      set({ searchQuery: query, results: [], isLoading: false, error: null });
      return;
    }

    if (activeController) {
      activeController.abort();
    }
    const controller = new AbortController();
    activeController = controller;

    set({ isLoading: true, error: null });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();

      // Ignore stale responses from superseded requests
      if (activeController !== controller) return;
      set({ results: data, isLoading: false });
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (activeController !== controller) return;
      set({ error: err.message || 'An error occurred during search', isLoading: false });
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  },
}));
