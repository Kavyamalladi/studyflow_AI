import { cn } from '@/utils';
import { useStudyStore } from '@/store/study.store';
import { NAV_ITEMS } from './navItems';
import { PanelLeftClose, PanelLeftOpen, ArrowLeft } from 'lucide-react';

export function WorkspaceSidebar() {
  const activeTab = useStudyStore((s) => s.activeTab);
  const isSidebarOpen = useStudyStore((s) => s.isSidebarOpen);
  const setActiveTab = useStudyStore((s) => s.setActiveTab);
  const toggleSidebar = useStudyStore((s) => s.toggleSidebar);
  const returnHome = useStudyStore((s) => s.returnHome);
  const session = useStudyStore((s) => s.currentSession);
  const fcProgress = useStudyStore((s) => s.flashcardProgress);
  const quizProgress = useStudyStore((s) => s.quizProgress);

  const totalCards = session?.flashcards.length ?? 0;
  const cardsDone = fcProgress.seenCount;
  const quizPct = quizProgress?.total
    ? Math.round((quizProgress.score / quizProgress.total) * 100)
    : null;
  const overallPct = quizPct !== null
    ? Math.round(((cardsDone / Math.max(totalCards, 1)) * 100 + quizPct) / 2)
    : totalCards > 0
      ? Math.round((cardsDone / totalCards) * 100)
      : 0;

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[var(--color-border)] bg-[var(--color-secondary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isSidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      {/* Top: logo + collapse */}
      <div className={cn('flex h-14 items-center border-b border-[var(--color-border)]', isSidebarOpen ? 'justify-between px-4' : 'justify-center')}>
        {isSidebarOpen && (
          <span className="text-[13px] font-semibold tracking-tight text-[var(--color-foreground)]">StudyFlow AI</span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
        </button>
      </div>

      {/* Session info */}
      {isSidebarOpen && session && (
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <p className="truncate text-[12px] font-medium text-[var(--color-muted-foreground)]">Current session</p>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--color-foreground)]">{session.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary)]">
              {session.difficulty}
            </span>
            <span className="text-[11px] text-[var(--color-muted-foreground)]">{session.estimatedMinutes}m</span>
          </div>

          {/* Progress */}
          {totalCards > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--color-muted-foreground)]">Progress</span>
                <span className="font-semibold text-[var(--color-primary)]">{overallPct}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--color-muted-foreground)]">
                <span>Cards {cardsDone}/{totalCards}</span>
                {quizPct !== null && <span>Quiz {quizPct}%</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={!isSidebarOpen ? item.label : undefined}
              className={cn(
                'group flex w-full items-center gap-3 px-3 py-2.5 transition-all duration-150',
                isSidebarOpen ? 'px-4' : 'justify-center px-0',
                isActive
                  ? 'bg-[rgba(139,92,246,0.1)] text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]',
              )}
            >
              <div className={cn('relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-[rgba(139,92,246,0.2)]' : 'group-hover:bg-[var(--color-input)]')}>
                <Icon className="size-4" />
                {isActive && (
                  <span className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
                )}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-medium leading-none">{item.label}</p>
                  <p className={cn('mt-0.5 text-[11px]', isActive ? 'text-[var(--color-primary)]/70' : 'text-[var(--color-muted-foreground)]')}>{item.description}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="border-t border-[var(--color-border)] p-2">
        <button
          type="button"
          onClick={returnHome}
          title={!isSidebarOpen ? 'New session' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]',
            !isSidebarOpen && 'justify-center px-0',
          )}
        >
          <ArrowLeft className="size-4 shrink-0" />
          {isSidebarOpen && <span className="text-[13px] font-medium">New session</span>}
        </button>
      </div>
    </aside>
  );
}
