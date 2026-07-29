import { useStudyStore } from '@/store/study.store';
import { NAV_ITEMS } from './navItems';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

export function WorkspaceTopBar() {
  const session    = useStudyStore((s) => s.currentSession);
  const activeTab  = useStudyStore((s) => s.activeTab);
  const setActiveTab = useStudyStore((s) => s.setActiveTab);
  const returnHome = useStudyStore((s) => s.returnHome);

  const currentIndex = NAV_ITEMS.findIndex((n) => n.id === activeTab);
  const activeItem   = NAV_ITEMS[currentIndex];
  const prevItem     = currentIndex > 0 ? NAV_ITEMS[currentIndex - 1] : null;
  const nextItem     = currentIndex < NAV_ITEMS.length - 1 ? NAV_ITEMS[currentIndex + 1] : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)] px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="font-medium text-[var(--color-muted)]">{session?.name}</span>
        <span className="text-[var(--color-muted-foreground)]">/</span>
        <span className="font-medium text-[var(--color-foreground)]">{activeItem?.label}</span>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!prevItem}
          onClick={() => prevItem && setActiveTab(prevItem.id)}
          title={prevItem ? `Previous: ${prevItem.label}` : undefined}
          className="flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-[rgba(255,255,255,0.14)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">{prevItem?.label ?? 'Prev'}</span>
        </button>

        <span className="px-2 text-[12px] tabular-nums text-[#52525b]">
          {currentIndex + 1} / {NAV_ITEMS.length}
        </span>

        <button
          type="button"
          disabled={!nextItem}
          onClick={() => nextItem && setActiveTab(nextItem.id)}
          title={nextItem ? `Next: ${nextItem.label}` : undefined}
          className="flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-[rgba(255,255,255,0.14)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="hidden sm:inline">{nextItem?.label ?? 'Next'}</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={returnHome}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-muted)] transition-all hover:border-[var(--color-ring)] hover:text-[var(--color-foreground)]"
        >
          <Edit3 className="size-3.5" />
          New session
        </button>
      </div>
    </header>
  );
}
