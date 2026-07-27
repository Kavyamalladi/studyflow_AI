import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';

const SHORTCUTS = [
  { section: 'Global' },
  { keys: ['⌘', '↵'],  desc: 'Generate study workspace' },
  { keys: ['?'],        desc: 'Show this shortcuts panel' },
  { keys: ['Esc'],      desc: 'Close dialogs' },

  { section: 'Workspace navigation' },
  { keys: ['1'],   desc: 'Go to Overview' },
  { keys: ['2'],   desc: 'Go to Flashcards' },
  { keys: ['3'],   desc: 'Go to Quiz' },
  { keys: ['4'],   desc: 'Go to Summary' },
  { keys: ['5'],   desc: 'Go to Analytics' },
  { keys: ['['],   desc: 'Previous section' },
  { keys: [']'],   desc: 'Next section' },

  { section: 'Flashcards' },
  { keys: ['←', '→'],  desc: 'Previous / Next card' },
  { keys: ['Space'],    desc: 'Flip card' },
] as const;

export function KeyboardShortcutsModal() {
  const isOpen = useStudyStore((s) => s.isShortcutsOpen);
  const setOpen = useStudyStore((s) => s.setShortcutsOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="kbd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="kbd-panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-sm px-4"
          >
            <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#18181b] shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="size-4 text-[#8b5cf6]" />
                  <span className="text-[14px] font-semibold text-white">Keyboard Shortcuts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-[#71717a] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                  aria-label="Close shortcuts"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="max-h-[60vh] space-y-1 overflow-y-auto p-3 scrollbar-thin">
                {SHORTCUTS.map((item, i) => {
                  if ('section' in item) {
                    return (
                      <p key={i} className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525b] first:pt-1">
                        {item.section}
                      </p>
                    );
                  }
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5">
                      <span className="text-[13px] text-[#a1a1aa]">{item.desc}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k) => (
                          <kbd key={k} className="kbd">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
