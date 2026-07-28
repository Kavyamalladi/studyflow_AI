import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Bookmark, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { cn } from '@/utils';

type Confidence = 'easy' | 'hard' | 'skip';
interface CardResult { id: string; confidence: Confidence }

const CONFIDENCE_OPTS: { id: Confidence; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'hard', label: 'Hard',  icon: ThumbsDown, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { id: 'skip', label: 'Skip',  icon: Minus,      color: 'var(--color-muted)', bg: 'var(--color-border)' },
  { id: 'easy', label: 'Easy',  icon: ThumbsUp,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
];

function EmptyGuard() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-14 text-center">
      <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">No flashcards yet</h1>
      <p className="text-[14px] text-[var(--color-muted)]">
        This session doesn't have any flashcards. Generate a new session with study notes to create some.
      </p>
    </div>
  );
}

export function FlashcardsModule() {
  const session = useStudyStore((s) => s.currentSession);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<CardResult[]>([]);
  const [done, setDone] = useState(false);
  const goTimer = useRef<ReturnType<typeof setTimeout>>(null);

  if (!session) return null;
  const cards = session.flashcards;
  const total = cards.length;

  if (total === 0) return <EmptyGuard />;

  const card = cards[index];
  const progress = ((index + 1) / total) * 100;

  const go = useCallback((dir: 1 | -1) => {
    setIsFlipped(false);
    if (goTimer.current) clearTimeout(goTimer.current);
    goTimer.current = setTimeout(() => setIndex((i) => Math.max(0, Math.min(total - 1, i + dir))), 80);
  }, [total]);

  const handleConfidence = (conf: Confidence) => {
    const next = [...results, { id: card.id, confidence: conf }];
    setResults(next);
    if (index < total - 1) {
      go(1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setIndex(0);
    setIsFlipped(false);
    setResults([]);
    setDone(false);
  };

  const toggleBookmark = () =>
    setBookmarked((b) => {
      const n = new Set(b);
      n.has(card.id) ? n.delete(card.id) : n.add(card.id);
      return n;
    });

  useKeyboardShortcut({ key: 'ArrowRight', ignoreInputs: false }, () => {
    if (isFlipped) return;
    if (index < total - 1) go(1);
  });
  useKeyboardShortcut({ key: 'ArrowLeft', ignoreInputs: false }, () => {
    if (isFlipped) return;
    if (index > 0) go(-1);
  });
  useKeyboardShortcut({ key: ' ', ignoreInputs: false }, () => setIsFlipped((f) => !f));

  // Summary screen
  if (done) {
    const easy = results.filter((r) => r.confidence === 'easy').length;
    const hard = results.filter((r) => r.confidence === 'hard').length;
    const skip = results.filter((r) => r.confidence === 'skip').length;
    const mastery = total > 0 ? Math.round((easy / total) * 100) : 0;

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-14 text-center">
        <div className="relative">
          <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="var(--color-border)" strokeWidth={8} />
            <circle
              cx={60} cy={60} r={52} fill="none" stroke="#8b5cf6" strokeWidth={8}
              strokeDasharray={326.7} strokeDashoffset={326.7 * (1 - mastery / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-[var(--color-foreground)]">{mastery}%</span>
            <span className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-wide">mastery</span>
          </div>
        </div>

        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-foreground)]">
            {mastery >= 70 ? 'Strong session!' : mastery >= 40 ? 'Making progress.' : 'Keep reviewing.'}
          </h1>
          <p className="mt-1 text-[14px] text-[var(--color-muted)]">You went through {total} cards</p>
        </div>

        <div className="flex w-full justify-center gap-4">
          {[
            { label: 'Easy', count: easy, color: '#22c55e' },
            { label: 'Hard', count: hard, color: '#ef4444' },
            { label: 'Skipped', count: skip, color: 'var(--color-muted)' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-4">
              <span className="text-[22px] font-bold" style={{ color }}>{count}</span>
              <span className="text-[12px] text-[var(--color-muted-foreground)]">{label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <RotateCcw className="size-4" />
          Study again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">Flashcards</h1>
          <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">
            Card {index + 1} of {total}
            <span className="mx-1.5 text-[var(--color-muted-foreground)]">·</span>
            <span className="rounded-md bg-[rgba(139,92,246,0.12)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-primary)]">
              {card.tag}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            title="Restart deck"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleBookmark}
            title="Bookmark card"
            className={cn(
              'flex size-9 items-center justify-center rounded-lg transition-colors',
              bookmarked.has(card.id)
                ? 'bg-[rgba(139,92,246,0.15)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]',
            )}
          >
            <Bookmark className={cn('size-4', bookmarked.has(card.id) && 'fill-current')} />
          </button>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <motion.div
          className="h-full rounded-full bg-[var(--color-primary)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex gap-1 overflow-hidden">
        {cards.map((_, i) => (
          <div
            key={i}
            className={cn('h-0.5 flex-1 rounded-full transition-colors', i <= index ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]')}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="relative cursor-pointer select-none"
            style={{ perspective: '1400px', minHeight: 260 }}
            onClick={() => setIsFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Answer side — click to see question' : 'Question side — click to reveal answer'}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="flex min-h-[260px] flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                    Question
                  </span>
                  <span className="text-[11px] text-[var(--color-muted-foreground)]">Space to flip</span>
                </div>
                <div className="mt-5 flex flex-1 items-center">
                  <p className="text-[19px] font-semibold leading-snug text-[var(--color-foreground)]">
                    {card.question}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-muted-foreground)]">Click to reveal</span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
              </div>

              <div
                className="absolute inset-0 flex min-h-[260px] flex-col rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.04)] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                  Answer
                </span>
                <div className="mt-4 flex flex-1 items-start">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-secondary-foreground)]">
                    {card.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="space-y-2"
          >
            <p className="text-center text-[12px] text-[var(--color-muted-foreground)]">How well did you know this?</p>
            <div className="flex gap-2">
              {CONFIDENCE_OPTS.map(({ id, label, icon: Icon, color, bg }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleConfidence(id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] py-3 text-[13px] font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ color, background: bg }}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-muted)] transition-all hover:border-[var(--color-input)] hover:text-[var(--color-foreground)] disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="text-[12px] text-[var(--color-muted-foreground)]">Arrow keys</span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-muted)] transition-all hover:border-[var(--color-input)] hover:text-[var(--color-foreground)] disabled:pointer-events-none disabled:opacity-25"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>

      {bookmarked.size > 0 && (
        <p className="text-center text-[12px] text-[var(--color-primary)]">
          {bookmarked.size} card{bookmarked.size > 1 ? 's' : ''} bookmarked
        </p>
      )}
    </div>
  );
}
