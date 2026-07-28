import { useEffect, useRef } from 'react';

interface Options {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  ignoreInputs?: boolean;
}

export function useKeyboardShortcut(options: Options, callback: () => void) {
  const { key, ctrl, meta, shift, ignoreInputs = true } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
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
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrl, meta, shift, ignoreInputs]);
}
