import { AnimatePresence, motion } from 'framer-motion';
import { useStudyStore } from '@/store/study.store';
import { HomeView } from '@/features/home/HomeView';
import { GeneratingView } from '@/features/generation/GeneratingView';
import { WorkspaceView } from '@/features/workspace/WorkspaceView';
import { ToastStack } from '@/components/ui/ToastStack';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { useGlobalKeyboard } from '@/hooks/useGlobalKeyboard';

function GlobalProviders() {
  useGlobalKeyboard();
  return null;
}

export function ProductWorkspacePage() {
  const view = useStudyStore((s) => s.view);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <GlobalProviders />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(2px)' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Subtle top radial glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(139,92,246,0.1) 0%, transparent 70%)',
              }}
            />
            <HomeView />
          </motion.div>
        )}

        {view === 'generating' && (
          <motion.div
            key="generating"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GeneratingView />
          </motion.div>
        )}

        {view === 'workspace' && (
          <motion.div
            key="workspace"
            className="absolute inset-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <WorkspaceView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global UI layers */}
      <KeyboardShortcutsModal />
      <ToastStack />
    </div>
  );
}
