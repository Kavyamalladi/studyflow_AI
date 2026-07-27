import { useEffect } from 'react';
import { useStudyStore, type WorkspaceTab } from '@/store/study.store';

const TAB_ORDER: WorkspaceTab[] = ['overview', 'flashcards', 'quiz', 'summary', 'analytics'];

/**
 * Global keyboard shortcuts mounted once at the app root.
 * Shortcuts are context-aware: workspace-only shortcuts only fire in workspace view.
 */
export function useGlobalKeyboard() {
  const view           = useStudyStore((s) => s.view);
  const activeTab      = useStudyStore((s) => s.activeTab);
  const setActiveTab   = useStudyStore((s) => s.setActiveTab);
  const goBack         = useStudyStore((s) => s.goBack);
  const returnHome     = useStudyStore((s) => s.returnHome);
  const setShortcutsOpen = useStudyStore((s) => s.setShortcutsOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // — Escape: close dialogs or return home from workspace
      if (e.key === 'Escape' && !isInput) {
        e.preventDefault();
        setShortcutsOpen(false);
        return;
      }

      // — ? : open keyboard shortcuts modal
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // — workspace-only shortcuts ──────────────────────
      if (view !== 'workspace') return;

      // Number keys 1-5 → switch tabs (not in inputs)
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (tabIndex >= 0 && tabIndex < TAB_ORDER.length) {
          e.preventDefault();
          setActiveTab(TAB_ORDER[tabIndex]);
          return;
        }
      }

      // [ and ] → cycle tabs
      if (!isInput && !e.ctrlKey && !e.metaKey) {
        const currentIndex = TAB_ORDER.indexOf(activeTab as WorkspaceTab);
        if (e.key === ']' && currentIndex < TAB_ORDER.length - 1) {
          e.preventDefault();
          setActiveTab(TAB_ORDER[currentIndex + 1]);
          return;
        }
        if (e.key === '[' && currentIndex > 0) {
          e.preventDefault();
          setActiveTab(TAB_ORDER[currentIndex - 1]);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, activeTab, setActiveTab, goBack, returnHome, setShortcutsOpen]);
}
