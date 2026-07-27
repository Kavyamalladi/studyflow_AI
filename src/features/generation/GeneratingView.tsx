import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '@/store/study.store';

const STEPS = [
  { label: 'Understanding notes', duration: 900 },
  { label: 'Extracting concepts', duration: 800 },
  { label: 'Creating flashcards', duration: 750 },
  { label: 'Generating quiz', duration: 700 },
  { label: 'Preparing workspace', duration: 600 },
] as const;

export function GeneratingView() {
  const finishGeneration = useStudyStore((s) => s.finishGeneration);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let accumulated = 0;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);

    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (!mounted) return;
        setStepIndex(i);

        const start = accumulated;
        const end = accumulated + STEPS[i].duration;
        const stepDuration = STEPS[i].duration;
        const startTime = performance.now();

        await new Promise<void>((resolve) => {
          const tick = (now: number) => {
            if (!mounted) { resolve(); return; }
            const elapsed = now - startTime;
            const frac = Math.min(elapsed / stepDuration, 1);
            const p = ((start + frac * stepDuration) / totalDuration) * 100;
            setProgress(p);
            if (frac < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });

        accumulated = end;
      }

      if (mounted) {
        setProgress(100);
        await new Promise((r) => setTimeout(r, 350));
        finishGeneration();
      }
    };

    run();
    return () => { mounted = false; };
  }, [finishGeneration]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-10 text-center">

        {/* Animated logo orb */}
        <div className="relative mx-auto size-20">
          {/* Pulsing rings */}
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
          {/* Core */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 32px rgba(139,92,246,0.6), 0 0 64px rgba(139,92,246,0.3)' }}
          />
          {/* Inner glow */}
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
