import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = resolveTheme(theme);
  const isDark = resolved === 'dark';
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
}

export function getSystemTheme(): 'light' | 'dark' {
  return resolveTheme('system');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'studyflow-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);

export function initTheme() {
  const stored = (() => {
    try {
      const raw = localStorage.getItem('studyflow-theme');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return (data?.state?.theme as Theme) ?? null;
    } catch {
      return null;
    }
  })();

  applyTheme(stored ?? 'system');

  window.matchMedia(SYSTEM_QUERY).addEventListener('change', () => {
    if (useThemeStore.getState().theme === 'system') {
      applyTheme('system');
    }
  });
}
