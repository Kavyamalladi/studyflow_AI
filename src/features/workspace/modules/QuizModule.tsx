import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { useCountdown, formatTime } from '@/hooks/useCountdown';
import { cn } from '@/utils';

type QuizState = 'question' | 'answered' | 'done';

const TIME_PER_QUESTION = 30;

interface QuestionRecord {
  answered: number | null;
  timeUsed: number;
}

function EmptyGuard() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-14 text-center">
      <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">No quiz questions yet</h1>
      <p className="text-[14px] text-[var(--color-muted)]">
        This session doesn't have any quiz questions. Generate a new session with study notes to create some.
      </p>
    </div>
  );
}

export function QuizModule() {
  const session = useStudyStore((s) => s.currentSession);
  const recordQuizComplete = useStudyStore((s) => s.recordQuizComplete);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [records, setRecords] = useState<QuestionRecord[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('question');
  const [timerActive, setTimerActive] = useState(true);
  const [timeUsedNow, setTimeUsedNow] = useState(0);

  const onTimerExpire = useCallback(() => {
    if (quizState === 'question') {
      setTimeUsedNow(TIME_PER_QUESTION);
      setQuizState('answered');
      setTimerActive(false);
    }
  }, [quizState]);

  const { remaining, reset: resetTimer, fraction } = useCountdown(
    TIME_PER_QUESTION,
    onTimerExpire,
    timerActive && quizState === 'question',
  );

  if (!session) return null;
  const questions = session.quizQuestions;
  const total = questions.length;

  if (total === 0) return <EmptyGuard />;

  const question = questions[index];
  const progressPct = ((index + 1) / total) * 100;

  const choose = (i: number) => {
    if (quizState === 'answered') return;
    const used = TIME_PER_QUESTION - remaining;
    setTimeUsedNow(used);
    setSelected(i);
    setQuizState('answered');
    setTimerActive(false);
  };

  const next = () => {
    const record = { answered: selected, timeUsed: timeUsedNow };
    if (index < total - 1) {
      setRecords((r) => [...r, record]);
      setIndex((i) => i + 1);
      setSelected(null);
      setQuizState('question');
      setTimerActive(true);
      resetTimer(TIME_PER_QUESTION);
    } else {
      setRecords((r) => {
        const all = [...r, record];
        const score = all.filter((rec, i) => rec.answered === questions[i]?.correctIndex).length;
        recordQuizComplete(score, all.length);
        return all;
      });
      setQuizState('done');
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setRecords([]);
    setQuizState('question');
    setTimerActive(true);
    resetTimer(TIME_PER_QUESTION);
  };

  const timerColor =
    fraction > 0.5 ? '#22c55e' : fraction > 0.25 ? '#f59e0b' : '#ef4444';

  // ── Done screen ──
  if (quizState === 'done') {
    const allRecords = records.slice(0, total);
    const score = allRecords.filter((r, i) => r.answered === questions[i]?.correctIndex).length;
    const pct = Math.round((score / Math.max(total, 1)) * 100);
    const avgTime = allRecords.reduce((s, r) => s + r.timeUsed, 0) / Math.max(allRecords.length, 1);
    const isPass = pct >= 70;

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-12 text-center">
        <div className="relative">
          <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={64} cy={64} r={56} fill="none" stroke="var(--color-border)" strokeWidth={8} />
            <circle
              cx={64} cy={64} r={56} fill="none"
              stroke={isPass ? '#22c55e' : '#ef4444'}
              strokeWidth={8}
              strokeDasharray={351.9}
              strokeDashoffset={351.9 * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.9s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold" style={{ color: isPass ? '#22c55e' : '#ef4444' }}>{pct}%</span>
            <span className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">score</span>
          </div>
        </div>

        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-foreground)]">
            {isPass ? 'Great work!' : pct >= 40 ? 'Keep going!' : 'Practice more'}
          </h1>
          <p className="mt-1 text-[14px] text-[var(--color-muted)]">
            {score} of {total} correct · avg {Math.round(avgTime)}s per question
          </p>
        </div>

        <div className="w-full space-y-3 text-left">
          {questions.map((q, i) => {
            const rec = allRecords[i];
            const correct = rec?.answered === q.correctIndex;
            const timedOut = rec?.answered === null;
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-xl border p-4',
                  correct
                    ? 'border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.04)]'
                    : 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)]',
                )}
              >
                <div className="flex items-start gap-3">
                  {correct ? (
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-[#22c55e]" />
                  ) : timedOut ? (
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-destructive)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[var(--color-foreground)]">{q.question}</p>
                    {!correct && (
                      <p className="mt-1 text-[12px] text-[var(--color-muted)]">
                        {timedOut ? 'Time ran out · ' : 'Your answer was wrong · '}
                        Correct: <span className="font-medium text-[var(--color-success)]">{q.options[q.correctIndex]}</span>
                      </p>
                    )}
                    <p className="mt-1 text-[12px] italic text-[var(--color-muted-foreground)]">{q.explanation}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--color-muted-foreground)]">{rec?.timeUsed ?? '--'}s</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    );
  }

  // ── Question screen ──
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">Quiz</h1>
          <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">
            Question {index + 1} of {total}
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-[15px] font-bold tabular-nums transition-colors"
          style={{
            color: timerColor,
            borderColor: `${timerColor}33`,
            background: `${timerColor}0d`,
          }}
        >
          <Clock className="size-4" />
          {formatTime(remaining)}
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <motion.div
            className="h-full rounded-full bg-[var(--color-primary)]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <motion.div
            className="h-full rounded-full transition-colors"
            animate={{ width: `${fraction * 100}%` }}
            style={{ background: timerColor }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-6">
            <p className="text-[17px] font-semibold leading-relaxed text-[var(--color-foreground)]">
              {question.question}
            </p>
          </div>

          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              const isSelected = selected === i;
              const isCorrect = i === question.correctIndex;
              const show = quizState === 'answered';

              let borderCol = 'var(--color-border)';
              let bgClass = 'bg-[var(--color-surface)]';
              let textClass = 'text-[var(--color-foreground)]';

              if (show && isCorrect) {
                borderCol = 'rgba(34,197,94,0.45)';
                bgClass = 'bg-[rgba(34,197,94,0.06)]';
                textClass = 'text-[var(--color-success)]';
              } else if (show && isSelected && !isCorrect) {
                borderCol = 'rgba(239,68,68,0.45)';
                bgClass = 'bg-[rgba(239,68,68,0.06)]';
                textClass = 'text-[var(--color-destructive)]';
              } else if (!show && isSelected) {
                borderCol = 'rgba(139,92,246,0.55)';
                bgClass = 'bg-[rgba(139,92,246,0.08)]';
                textClass = 'text-[var(--color-primary)]';
              }

              return (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={!show ? { scale: 0.99 } : {}}
                  onClick={() => choose(i)}
                  style={{ borderColor: borderCol }}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200',
                    bgClass,
                    show ? 'cursor-default' : 'cursor-pointer hover:border-[var(--color-input)]',
                  )}
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
                    style={{
                      borderColor: borderCol,
                      color: show && isCorrect ? '#22c55e' : show && isSelected ? '#ef4444' : 'var(--color-muted)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={cn('text-[14px] font-medium leading-snug flex-1', textClass)}>{option}</span>
                  {show && isCorrect && <CheckCircle className="shrink-0 size-4 text-[var(--color-success)]" />}
                  {show && isSelected && !isCorrect && <XCircle className="shrink-0 size-4 text-[var(--color-destructive)]" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {quizState === 'answered' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  Explanation
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {quizState === 'answered' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              {index < total - 1 ? 'Next question' : 'See results'}
              <ChevronRight className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
