import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch, logout as apiLogout, refreshAccessToken } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AUTH_STORAGE_KEY = 'bookland-auth-minimal';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      register: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<{ user: User }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, name, password }),
          });
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<{ user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
          throw err;
        }
      },
      restore: async () => {
        set({ isLoading: true });
        try {
          const user = await apiFetch<User>('/api/auth/me');
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          if (err.code === 'TOKEN_EXPIRED') {
            try {
              await refreshAccessToken();
              const user = await apiFetch<User>('/api/auth/me');
              set({ user, isAuthenticated: true, isLoading: false });
              return;
            } catch {
              // refresh failed, fall through
            }
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      logout: async () => {
        try {
          await apiLogout();
        } catch {
          // ignore logout errors
        }
        set({ user: null, isAuthenticated: false, error: null });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);