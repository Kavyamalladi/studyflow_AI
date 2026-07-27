import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { useCountdown, formatTime } from '@/hooks/useCountdown';
import { cn } from '@/utils';

type QuizState = 'question' | 'answered' | 'done';

const TIME_PER_QUESTION = 30; // seconds

interface QuestionRecord {
  answered: number | null;
  timeUsed: number;
}

export function QuizModule() {
  const session = useStudyStore((s) => s.currentSession);
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
  const question = questions[index];
  const total = questions.length;
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
    setRecords((r) => [...r, { answered: selected, timeUsed: timeUsedNow }]);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setQuizState('question');
      setTimerActive(true);
      resetTimer(TIME_PER_QUESTION);
    } else {
      setRecords((r) => [...r, { answered: selected, timeUsed: timeUsedNow }]);
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

  // Timer color
  const timerColor =
    fraction > 0.5 ? '#22c55e' : fraction > 0.25 ? '#f59e0b' : '#ef4444';

  // ── Done screen ──
  if (quizState === 'done') {
    const allRecords = records.slice(0, total);
    const score = allRecords.filter((r, i) => r.answered === questions[i]?.correctIndex).length;
    const pct = Math.round((score / total) * 100);
    const avgTime = allRecords.reduce((s, r) => s + r.timeUsed, 0) / (allRecords.length || 1);
    const isPass = pct >= 70;

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-12 text-center">
        {/* Score ring */}
        <div className="relative">
          <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={64} cy={64} r={56} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
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
            <span className="text-[11px] uppercase tracking-wide text-[#71717a]">score</span>
          </div>
        </div>

        <div>
          <h1 className="text-[22px] font-bold text-white">
            {isPass ? '🎉 Great work!' : pct >= 40 ? '📚 Keep going!' : '💪 Practice more'}
          </h1>
          <p className="mt-1 text-[14px] text-[#a1a1aa]">
            {score} of {total} correct · avg {Math.round(avgTime)}s per question
          </p>
        </div>

        {/* Per-question review */}
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
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#f59e0b]" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-[#ef4444]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white">{q.question}</p>
                    {!correct && (
                      <p className="mt-1 text-[12px] text-[#a1a1aa]">
                        {timedOut ? 'Time ran out · ' : 'Your answer was wrong · '}
                        Correct: <span className="font-medium text-[#22c55e]">{q.options[q.correctIndex]}</span>
                      </p>
                    )}
                    <p className="mt-1 text-[12px] italic text-[#71717a]">{q.explanation}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#71717a]">{rec?.timeUsed ?? '--'}s</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-7 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#7c3aed]"
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-white">Quiz</h1>
          <p className="mt-0.5 text-[13px] text-[#a1a1aa]">
            Question {index + 1} of {total}
          </p>
        </div>

        {/* Timer */}
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

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <motion.div
            className="h-full rounded-full bg-[#8b5cf6]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Timer bar */}
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]">
          <motion.div
            className="h-full rounded-full transition-colors"
            animate={{ width: `${fraction * 100}%` }}
            style={{ background: timerColor }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      {/* Animated question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28 }}
          className="space-y-5"
        >
          {/* Question card */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#18181b] px-7 py-6">
            <p className="text-[17px] font-semibold leading-relaxed text-white">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              const isSelected = selected === i;
              const isCorrect = i === question.correctIndex;
              const show = quizState === 'answered';

              let borderCol = 'rgba(255,255,255,0.08)';
              let bgClass = 'bg-[#18181b]';
              let textClass = 'text-white/80';

              if (show && isCorrect) {
                borderCol = 'rgba(34,197,94,0.45)';
                bgClass = 'bg-[rgba(34,197,94,0.06)]';
                textClass = 'text-[#22c55e]';
              } else if (show && isSelected && !isCorrect) {
                borderCol = 'rgba(239,68,68,0.45)';
                bgClass = 'bg-[rgba(239,68,68,0.06)]';
                textClass = 'text-[#ef4444]';
              } else if (!show && isSelected) {
                borderCol = 'rgba(139,92,246,0.55)';
                bgClass = 'bg-[rgba(139,92,246,0.08)]';
                textClass = 'text-[#8b5cf6]';
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
                    show ? 'cursor-default' : 'cursor-pointer hover:border-[rgba(255,255,255,0.2)]',
                  )}
                >
                  {/* Letter badge */}
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
                    style={{
                      borderColor: borderCol,
                      color: show && isCorrect ? '#22c55e' : show && isSelected ? '#ef4444' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={cn('text-[14px] font-medium leading-snug flex-1', textClass)}>{option}</span>
                  {show && isCorrect && <CheckCircle className="shrink-0 size-4 text-[#22c55e]" />}
                  {show && isSelected && !isCorrect && <XCircle className="shrink-0 size-4 text-[#ef4444]" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {quizState === 'answered' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-4"
              >
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8b5cf6]">
                  Explanation
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#a1a1aa]">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
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
              className="flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#7c3aed]"
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
