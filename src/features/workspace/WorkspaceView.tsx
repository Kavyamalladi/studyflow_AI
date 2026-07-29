import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudyStore, type WorkspaceTab } from '@/store/study.store';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { OverviewModule } from './modules/OverviewModule';
import { FlashcardsModule } from './modules/FlashcardsModule';
import { QuizModule } from './modules/QuizModule';
import { SummaryModule } from './modules/SummaryModule';
import { MnemonicsModule } from './modules/MnemonicsModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { SettingsModule } from './modules/SettingsModule';

const TAB_ORDER: WorkspaceTab[] = [
  'overview', 'flashcards', 'quiz', 'summary', 'mnemonics', 'analytics', 'settings',
];

function ActiveModule() {
  const activeTab = useStudyStore((s) => s.activeTab);
  switch (activeTab) {
    case 'overview': return <OverviewModule />;
    case 'flashcards': return <FlashcardsModule />;
    case 'quiz': return <QuizModule />;
    case 'summary': return <SummaryModule />;
    case 'mnemonics': return <MnemonicsModule />;
    case 'analytics': return <AnalyticsModule />;
    case 'settings': return <SettingsModule />;
  }
}

export function WorkspaceView() {
  const activeTab = useStudyStore((s) => s.activeTab);
  const setActiveTab = useStudyStore((s) => s.setActiveTab);

  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  return (
    <div className="flex h-full">
      <WorkspaceSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceTopBar />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              <ActiveModule />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Prev/Next navigation */}
        <footer className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-3">
          {prevTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(prevTab)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-input)] hover:text-[var(--color-foreground)]"
            >
              <ChevronLeft className="size-4" />
              {NAV_LABELS[prevTab]}
            </button>
          ) : <div />}

          <span className="text-[12px] text-[var(--color-muted-foreground)]">
            {currentIndex + 1} / {TAB_ORDER.length}
          </span>

          {nextTab ? (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-input)] hover:text-[var(--color-foreground)]"
            >
              {NAV_LABELS[nextTab]}
              <ChevronRight className="size-4" />
            </button>
          ) : <div />}
        </footer>
      </div>
    </div>
  );
}

const NAV_LABELS: Record<WorkspaceTab, string> = {
  overview: 'Overview',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
  summary: 'Summary',
  mnemonics: 'Mnemonics',
  analytics: 'Analytics',
  settings: 'Settings',
};
