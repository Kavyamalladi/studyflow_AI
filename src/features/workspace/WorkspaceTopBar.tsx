import { useStudyStore } from '@/store/study.store';
import { NAV_ITEMS } from './navItems';
import { Edit3 } from 'lucide-react';

export function WorkspaceTopBar() {
  const session = useStudyStore((s) => s.currentSession);
  const activeTab = useStudyStore((s) => s.activeTab);
  const returnHome = useStudyStore((s) => s.returnHome);

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#09090b] px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="font-medium text-muted">{session?.name}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{activeItem?.label}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={returnHome}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3.5 py-1.5 text-[13px] font-medium text-muted transition-all hover:border-[rgba(255,255,255,0.14)] hover:text-foreground"
        >
          <Edit3 className="size-3.5" />
          New session
        </button>
      </div>
    </header>
  );
}
