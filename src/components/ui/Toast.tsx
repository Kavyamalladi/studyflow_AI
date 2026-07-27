import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToastStore, type Toast, type ToastVariant } from '@/store/toast.store';
import { cn } from '@/utils';
import { shadowGlow } from './styles';

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border bg-card',
  success: 'border-success/30 bg-card',
  error: 'border-destructive/30 bg-card',
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />,
  error: <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const variant = toast.variant ?? 'default';

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4',
        shadowGlow,
        variantStyles[variant],
      )}
    >
      {variantIcons[variant]}
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm text-muted">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-muted transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed right-4 bottom-4 z-[100] flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
