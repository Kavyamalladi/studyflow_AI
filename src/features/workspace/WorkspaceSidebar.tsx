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

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[rgba(255,255,255,0.07)] bg-[#111015] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isSidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      {/* Top: logo + collapse */}
      <div className={cn('flex h-14 items-center border-b border-[rgba(255,255,255,0.07)]', isSidebarOpen ? 'justify-between px-4' : 'justify-center')}>
        {isSidebarOpen && (
          <span className="text-[13px] font-semibold tracking-tight text-foreground">StudyFlow AI</span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
        </button>
      </div>

      {/* Session info */}
      {isSidebarOpen && session && (
        <div className="border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
          <p className="truncate text-[12px] font-medium text-muted-foreground">Current session</p>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-foreground">{session.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-2 py-0.5 text-[11px] font-medium text-primary">
              {session.difficulty}
            </span>
            <span className="text-[11px] text-muted-foreground">{session.estimatedMinutes}m</span>
          </div>
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
                  ? 'bg-[rgba(139,92,246,0.1)] text-primary'
                  : 'text-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground',
              )}
            >
              <div className={cn('relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-[rgba(139,92,246,0.2)]' : 'group-hover:bg-[rgba(255,255,255,0.06)]')}>
                <Icon className="size-4" />
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-medium leading-none">{item.label}</p>
                  <p className={cn('mt-0.5 text-[11px]', isActive ? 'text-primary/70' : 'text-muted-foreground')}>{item.description}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="border-t border-[rgba(255,255,255,0.07)] p-2">
        <button
          type="button"
          onClick={returnHome}
          title={!isSidebarOpen ? 'New session' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-muted transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground',
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
