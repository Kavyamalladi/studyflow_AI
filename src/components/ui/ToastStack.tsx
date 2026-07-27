import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useStudyStore, type Toast } from '@/store/study.store';
import { cn } from '@/utils';

const CONFIG: Record<Toast['type'], { icon: React.ElementType; color: string; bg: string; border: string }> = {
  success: {
    icon:   CheckCircle2,
    color:  '#22c55e',
    bg:     'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
  error: {
    icon:   XCircle,
    color:  '#ef4444',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  info: {
    icon:   Info,
    color:  '#8b5cf6',
    bg:     'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useStudyStore((s) => s.removeToast);
  const { icon: Icon, color, bg, border } = CONFIG[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      role="alert"
      aria-live="polite"
      className="flex w-72 items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{ background: 'rgba(24,24,27,0.95)', backdropFilter: 'blur(12px)', borderColor: border }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} />
      <p className="flex-1 text-[13px] font-medium leading-snug text-white">{toast.message}</p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-[#71717a] transition-colors hover:text-white"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastStack() {
  const toasts = useStudyStore((s) => s.toasts);
  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
