import { useEffect } from 'react';

interface Options {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  /** Prevent triggering when focused on inputs */
  ignoreInputs?: boolean;
}

export function useKeyboardShortcut(options: Options, callback: () => void) {
  useEffect(() => {
    const { key, ctrl, meta, shift, ignoreInputs = true } = options;

    const handler = (e: KeyboardEvent) => {
      if (ignoreInputs) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      }
      if (ctrl && !e.ctrlKey) return;
      if (meta && !e.metaKey) return;
      if (shift && !e.shiftKey) return;
      if (e.key === key) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, callback]);
}
