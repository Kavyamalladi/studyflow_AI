import { AnimatePresence, motion } from 'framer-motion';
import { useStudyStore } from '@/store/study.store';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { OverviewModule } from './modules/OverviewModule';
import { FlashcardsModule } from './modules/FlashcardsModule';
import { QuizModule } from './modules/QuizModule';
import { SummaryModule } from './modules/SummaryModule';
import { MnemonicsModule } from './modules/MnemonicsModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { SettingsModule } from './modules/SettingsModule';

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

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <WorkspaceSidebar />

      {/* Main area */}
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
      </div>
    </div>
  );
}
