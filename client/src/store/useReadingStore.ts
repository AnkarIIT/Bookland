import { create } from 'zustand';

interface ReadingState {
  progress: Record<string, { last_page: number; progress_percent: number; last_read_at: string | null }>;
  isLoading: boolean;
  error: string | null;

  fetchProgress: (bookId: string) => Promise<void>;
  updateProgress: (bookId: string, last_page: number, progress_percent: number) => Promise<void>;
  getProgress: (bookId: string) => number;
  getLastPage: (bookId: string) => number;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  progress: {},
  isLoading: false,
  error: null,

  fetchProgress: async (bookId: string) => {
    // Extract ISBN from book ID
    const isbnMatch = bookId.match(/(isbn|gutenberg)-(.+)/);
    if (!isbnMatch) return;
    
    const isbn = isbnMatch[2];
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_URL}/api/history/book/${isbn}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          progress: {
            ...state.progress,
            [bookId]: data,
          },
        }));
      }
    } catch (err: any) {
      // Silent fail - reading progress is optional
    }
  },

  updateProgress: async (bookId: string, last_page: number, progress_percent: number) => {
    // Extract ISBN from book ID
    const isbnMatch = bookId.match(/(isbn|gutenberg)-(.+)/);
    if (!isbnMatch) return;
    
    const isbn = isbnMatch[2];
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_URL}/api/history/${isbn}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ last_page, progress_percent }),
      });

      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          progress: {
            ...state.progress,
            [bookId]: {
              last_page: data.last_page,
              progress_percent: data.progress_percent,
              last_read_at: data.last_read_at,
            },
          },
        }));
      }
    } catch (err: any) {
      set({ error: err.message || 'Error updating progress' });
    }
  },

  getProgress: (bookId: string) => {
    const { progress } = get();
    return progress[bookId]?.progress_percent || 0;
  },

  getLastPage: (bookId: string) => {
    const { progress } = get();
    return progress[bookId]?.last_page || 0;
  },
}));