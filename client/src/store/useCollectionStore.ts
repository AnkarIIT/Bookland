import { create } from 'zustand';
import { Book } from '../types';

interface CollectionState {
  savedBooks: Book[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  saveBook: (bookId: string) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  isSaved: (bookId: string) => boolean;
}

let activeController: AbortController | null = null;

export const useCollectionStore = create<CollectionState>((set, get) => ({
  savedBooks: [],
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    const controller = new AbortController();
    activeController = controller;

    set({ isLoading: true, error: null });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/collections`, {
        signal: controller.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      set({ savedBooks: data, isLoading: false });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        set({ error: err.message || 'Error fetching collections', isLoading: false });
      }
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  },

  saveBook: async (bookId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_URL}/api/collections/${bookId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save book');
      }

      // Optimistically add to saved books
      const { savedBooks } = get();
      // Note: In production, you'd want to refetch or add actual book data
    } catch (err: any) {
      set({ error: err.message || 'Error saving book' });
    }
  },

  removeBook: async (bookId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_URL}/api/collections/${bookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove book');
      }

      // Optimistically remove from saved books
      const { savedBooks } = get();
      set({ savedBooks: savedBooks.filter(b => b.id !== bookId) });
    } catch (err: any) {
      set({ error: err.message || 'Error removing book' });
    }
  },

  isSaved: (bookId: string) => {
    const { savedBooks } = get();
    return savedBooks.some(b => b.id === bookId);
  },
}));