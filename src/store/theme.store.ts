import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  root.classList.toggle('dark', isDark);
}

const systemThemeQuery = '(prefers-color-scheme: dark)';

export function subscribeSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia(systemThemeQuery);
  const handler = () => onStoreChange();
  media.addEventListener('change', handler);
  return () => media.removeEventListener('change', handler);
}

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light';
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

let themeInitialized = false;

export function initTheme() {
  if (themeInitialized) return;
  themeInitialized = true;

  applyTheme(useThemeStore.getState().theme);

  window.matchMedia(systemThemeQuery).addEventListener('change', () => {
    if (useThemeStore.getState().theme === 'system') {
      applyTheme('system');
    }
  });
}
