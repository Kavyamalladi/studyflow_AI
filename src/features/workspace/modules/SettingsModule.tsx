import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/utils';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferences.store';
import type { Theme } from '@/store/theme.store';

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Moon }[] = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
];

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[14px] font-medium text-[var(--color-foreground)]">{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-input)]',
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : '',
        )}
      />
    </button>
  );
}

export function SettingsModule() {
  const { theme, setTheme } = useTheme();
  const prefs = usePreferencesStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-8 py-10">
      <div>
        <h1 className="t-section">Settings</h1>
        <p className="t-label mt-0.5">Customize your study experience</p>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Appearance
        </h2>
        <SettingsRow label="Theme">
          <div className="flex gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] p-1">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                  theme === id
                    ? 'bg-[rgba(139,92,246,0.15)] text-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </SettingsRow>
      </div>

      {/* Study preferences */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Study Preferences
        </h2>
        <SettingsRow label="Card animations">
          <ToggleSwitch checked={prefs.cardAnimations} onChange={prefs.toggleCardAnimations} />
        </SettingsRow>
        <SettingsRow label="Keyboard shortcuts">
          <ToggleSwitch checked={prefs.keyboardShortcuts} onChange={prefs.toggleKeyboardShortcuts} />
        </SettingsRow>
        <SettingsRow label="Sound effects">
          <ToggleSwitch checked={prefs.soundEffects} onChange={prefs.toggleSoundEffects} />
        </SettingsRow>
      </div>

      {/* Keyboard shortcuts reference */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-3">
          {[
            { key: '← →', action: 'Navigate flashcards' },
            { key: 'Space', action: 'Flip flashcard' },
            { key: '⌘ Enter', action: 'Generate workspace' },
            { key: 'Esc', action: 'Close modal / Go back' },
          ].map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="t-body text-[var(--color-muted)]">{action}</span>
              <kbd className="kbd">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
