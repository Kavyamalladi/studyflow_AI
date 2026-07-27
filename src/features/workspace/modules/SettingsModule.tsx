import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/utils';

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
] as const;

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <span className="text-[14px] font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

export function SettingsModule() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-8 py-10">
      <div>
        <h1 className="t-section">Settings</h1>
        <p className="t-label mt-0.5">Customize your study experience</p>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-surface p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted">
          Appearance
        </h2>
        <SettingsRow label="Theme">
          <div className="flex gap-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-1">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                  id === 'dark'
                    ? 'bg-[rgba(139,92,246,0.15)] text-primary'
                    : 'text-muted hover:text-foreground',
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
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-surface p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted">
          Study Preferences
        </h2>
        <SettingsRow label="Card animations">
          <button
            type="button"
            role="switch"
            aria-checked
            className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary transition-colors"
          >
            <span className="absolute left-0.5 size-4 rounded-full bg-white transition-transform translate-x-4 shadow-sm" />
          </button>
        </SettingsRow>
        <SettingsRow label="Keyboard shortcuts">
          <button
            type="button"
            role="switch"
            aria-checked
            className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary transition-colors"
          >
            <span className="absolute left-0.5 size-4 rounded-full bg-white transition-transform translate-x-4 shadow-sm" />
          </button>
        </SettingsRow>
        <SettingsRow label="Sound effects">
          <button
            type="button"
            role="switch"
            className="relative inline-flex h-5 w-9 items-center rounded-full bg-[rgba(255,255,255,0.12)] transition-colors"
          >
            <span className="absolute left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform" />
          </button>
        </SettingsRow>
      </div>

      {/* Keyboard shortcuts reference */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-surface p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted">
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
              <span className="t-body text-muted">{action}</span>
              <kbd className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 font-mono text-[12px] text-foreground">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
