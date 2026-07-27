import { type ReactNode } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/store/theme.store';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

const cycle: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const icons: Record<Theme, ReactNode> = {
  light: <Sun className="size-4" aria-hidden="true" />,
  dark: <Moon className="size-4" aria-hidden="true" />,
  system: <Monitor className="size-4" aria-hidden="true" />,
};

const labels: Record<Theme, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip content={labels[theme]}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Theme: ${labels[theme]}. Click to switch.`}
        onClick={() => setTheme(cycle[theme])}
      >
        {icons[theme]}
      </Button>
    </Tooltip>
  );
}
