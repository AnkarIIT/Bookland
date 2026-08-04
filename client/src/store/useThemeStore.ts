import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        let nextTheme: 'light' | 'dark' | 'system';
        
        if (currentTheme === 'light') nextTheme = 'dark';
        else if (currentTheme === 'dark') nextTheme = 'system';
        else nextTheme = 'light';
        
        set({ theme: nextTheme });
        applyTheme(nextTheme);
      },
    }),
    {
      name: 'bookland-theme',
    }
  )
);

// Helper to apply classes to document
export const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const readSavedTheme = (): 'light' | 'dark' | 'system' => {
    try {
      const raw = localStorage.getItem('bookland-theme');
      return (JSON.parse(raw || '{}')?.state?.theme as 'light' | 'dark' | 'system') || 'system';
    } catch {
      return 'system';
    }
  };

  applyTheme(readSavedTheme());

  // Listen for system changes if system theme is active
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (readSavedTheme() === 'system') {
      applyTheme('system');
    }
  });
}
