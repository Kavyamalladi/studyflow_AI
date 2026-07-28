import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';

const STEPS = [
  { label: 'Understanding notes', duration: 900 },
  { label: 'Extracting concepts', duration: 800 },
  { label: 'Creating flashcards', duration: 750 },
  { label: 'Generating quiz', duration: 700 },
  { label: 'Preparing workspace', duration: 600 },
] as const;

export function GeneratingView() {
  const isGenerating = useStudyStore((s) => s.isGenerating);
  const generationError = useStudyStore((s) => s.generationError);
  const beginGeneration = useStudyStore((s) => s.beginGeneration);
  const cancelGeneration = useStudyStore((s) => s.cancelGeneration);

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    let mounted = true;
    let accumulated = 0;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);

    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (!mounted) return;
        setStepIndex(i);

        const start = accumulated;
        const stepDuration = STEPS[i].duration;
        const startTime = performance.now();

        await new Promise<void>((resolve) => {
          const tick = (now: number) => {
            if (!mounted) { resolve(); return; }
            const elapsed = now - startTime;
            const frac = Math.min(elapsed / stepDuration, 1);
            const p = ((start + frac * stepDuration) / totalDuration) * 100;
            setProgress(Math.min(p, 95));
            if (frac < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });

        accumulated += stepDuration;
      }

      if (mounted) {
        setProgress(95);
      }
    };

    setProgress(0);
    setStepIndex(0);
    run();
    return () => { mounted = false; };
  }, [isGenerating]);

  // ── Error state ──
  if (generationError) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[rgba(239,68,68,0.12)]">
            <AlertCircle className="size-7 text-[#ef4444]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-[17px] font-semibold text-white">Generation failed</h2>
            <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{generationError}</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={cancelGeneration}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-input)] hover:text-[var(--color-foreground)]"
            >
              <ArrowLeft className="size-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={beginGeneration}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Loading state ──
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10 text-center">

        {/* Animated logo orb */}
        <div className="relative mx-auto size-20">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary"
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 + i * 0.4 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 32px rgba(139,92,246,0.6), 0 0 64px rgba(139,92,246,0.3)' }}
          />
          <div className="absolute inset-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
        </div>

        {/* Step label */}
        <div className="space-y-1 h-12 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-[17px] font-semibold text-foreground"
            >
              {STEPS[stepIndex]?.label}…
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${stepIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="t-caption"
            >
              Step {stepIndex + 1} of {STEPS.length}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full bg-primary"
                animate={{ width: i < stepIndex ? 16 : i === stepIndex ? 20 : 6, opacity: i <= stepIndex ? 1 : 0.25 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
