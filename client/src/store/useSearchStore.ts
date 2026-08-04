import { create } from 'zustand';
import type { Book } from '../types';

interface SearchState {
  searchQuery: string;
  results: Book[];
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
}

let activeController: AbortController | null = null;

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  results: [],
  isLoading: false,
  error: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  performSearch: async (query) => {
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
