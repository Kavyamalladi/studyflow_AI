import { useSyncExternalStore } from 'react';
import { useThemeStore, getSystemTheme, subscribeSystemTheme, type Theme } from '@/store/theme.store';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    () => 'light' as const,
  );

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme;

  return { theme, setTheme, resolvedTheme } satisfies {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
  };
}
