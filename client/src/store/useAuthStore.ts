import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../lib/api';
import type { AuthResponse, User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  restore: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      register: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, name, password }),
          });
          set({ token: data.token, user: data.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          set({ token: data.token, user: data.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
          throw err;
        }
      },
      restore: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const user = await apiFetch<User>('/api/auth/me');
          set({ user, isLoading: false });
        } catch {
          set({ token: null, user: null, isLoading: false });
        }
      },
      logout: () => set({ token: null, user: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'bookland-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
