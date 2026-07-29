import { motion } from 'framer-motion';
import { Award, Clock, Layers, CheckCircle, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { ProgressRing } from '../components/ProgressRing';

interface BarProps { label: string; value: number; max: number; color: string }
function HBar({ label, value, max, color }: BarProps) {
  const pct = Math.round((value / Math.max(max, 1)) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-muted)]">{label}</span>
        <span className="text-[12px] font-semibold text-[var(--color-foreground)]">
          {value}/{max}
          <span className="ml-1 text-[11px] text-[var(--color-muted-foreground)]">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export function AnalyticsModule() {
  const session = useStudyStore((s) => s.currentSession);
  const quizProgress = useStudyStore((s) => s.quizProgress);
  const fcProgress = useStudyStore((s) => s.flashcardProgress);

  if (!session) return null;

  const totalCards = session.flashcards.length;
  const cardsReviewed = fcProgress.seenCount;
  const easyCards = Object.values(fcProgress.confidence).filter((c) => c === 'easy').length;
  const flashcardMastery = cardsReviewed > 0
    ? Math.round((easyCards / cardsReviewed) * 100)
    : null;
  const quizAccuracy = quizProgress && quizProgress.total > 0
    ? Math.round((quizProgress.score / quizProgress.total) * 100)
    : null;

  const parts = [flashcardMastery, quizAccuracy].filter((p): p is number => p !== null);
  const overallAccuracy = parts.length > 0
    ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    : 0;

  const tagStats = computeTagStats(session.flashcards, fcProgress.confidence);

  const weakTopics = tagStats
    .filter((t) => t.total > 0 && t.correct / t.total < 0.6)
    .map((t) => t.tag);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8">

      <div>
        <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">Analytics</h1>
        <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">Session performance overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Overall',         value: parts.length > 0 ? `${overallAccuracy}%` : '—', icon: TrendingUp, accent: true },
          { label: 'Flashcards',      value: flashcardMastery !== null ? `${flashcardMastery}%` : '—', icon: Layers, accent: false, sub: `${cardsReviewed}/${totalCards} rated` },
          { label: 'Quiz',            value: quizAccuracy !== null ? `${quizAccuracy}%` : '—', icon: Clock, accent: false, sub: quizProgress ? `${quizProgress.score}/${quizProgress.total}` : undefined },
          { label: 'Easy cards',      value: String(easyCards), icon: Award, accent: false },
        ].map(({ label, value, icon: Icon, accent, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div
              className="mb-3 flex size-9 items-center justify-center rounded-lg"
              style={accent ? { background: 'rgba(139,92,246,0.15)' } : { background: 'var(--color-input)' }}
            >
              <Icon className="size-4" style={{ color: accent ? '#8b5cf6' : '#a1a1aa' }} />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">{label}</p>
            <p className="mt-0.5 text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">{sub}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">

        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 lg:col-span-2">
          <ProgressRing size={120} strokeWidth={9} progress={overallAccuracy}>
            <div className="text-center">
              <span className="block text-[26px] font-bold text-[var(--color-foreground)]">{overallAccuracy}%</span>
              <span className="block text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">accuracy</span>
            </div>
          </ProgressRing>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-[var(--color-foreground)]">
              {overallAccuracy >= 80 ? 'Excellent' : overallAccuracy >= 60 ? 'Good progress' : overallAccuracy > 0 ? 'Needs work' : 'No data yet'}
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--color-muted-foreground)]">
              {parts.length > 0 ? `Combined: flashcards ${flashcardMastery ?? '—'}%${quizAccuracy !== null ? `, quiz ${quizAccuracy}%` : ''}` : 'Rate flashcards or take the quiz'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 className="size-4 text-[#8b5cf6]" />
            <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Performance by Tag</h2>
          </div>
          <div className="space-y-4">
            {tagStats.length > 0 ? tagStats.map(({ tag, correct, total }) => {
              const pct = total > 0 ? correct / total : 0;
              const color = pct >= 0.8 ? '#22c55e' : pct >= 0.5 ? '#8b5cf6' : '#ef4444';
              return <HBar key={tag} label={tag} value={correct} max={total} color={color} />;
            }) : (
              <p className="text-[13px] text-[var(--color-muted)]">Rate flashcards to see per-tag performance.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle className="size-4 text-[#8b5cf6]" />
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Session Content</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Flashcards',        count: session.flashcards.length,      cap: 8,  color: '#8b5cf6' },
            { label: 'Quiz Questions',    count: session.quizQuestions.length,   cap: 10, color: '#22c55e' },
            { label: 'Summary Sections',  count: session.summarySections.length, cap: 5,  color: '#f59e0b' },
            { label: 'Mnemonics',         count: session.mnemonics.length,       cap: 3,  color: '#3b82f6' },
          ].map(({ label, count, cap, color }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-36 shrink-0 text-[13px] text-[var(--color-muted)]">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / Math.max(cap, 1)) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                />
              </div>
              <span className="w-6 text-right text-[13px] font-semibold text-[var(--color-foreground)]">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {weakTopics.length > 0 && (
        <div className="rounded-2xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.04)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-[#f59e0b]" />
            <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Needs More Practice</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.1)] px-3 py-1.5 text-[12px] font-medium text-[#f59e0b]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-foreground)]">Objectives Status</h2>
        <ul className="space-y-3">
          {session.learningObjectives.map((obj, i) => {
            const done = quizAccuracy !== null && quizAccuracy >= 60 && i < Math.ceil(session.learningObjectives.length * (quizAccuracy / 100));
            return (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                  style={done
                    ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)' }
                    : { background: 'var(--color-border)', border: '1px solid var(--color-border)' }
                  }
                >
                  {done
                    ? <CheckCircle className="size-3 text-[#22c55e]" />
                    : <span className="size-1.5 rounded-full bg-[var(--color-muted-foreground)]" />
                  }
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{obj}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function computeTagStats(
  flashcards: Array<{ id: string; tag: string }>,
  confidence: Record<string, 'easy' | 'hard' | 'skip'>,
): Array<{ tag: string; correct: number; total: number }> {
  const map = new Map<string, { correct: number; total: number }>();
  for (const card of flashcards) {
    const entry = map.get(card.tag) ?? { correct: 0, total: 0 };
    entry.total++;
    const rating = confidence[card.id];
    if (rating === 'easy') entry.correct++;
    map.set(card.tag, entry);
  }
  return Array.from(map.entries()).map(([tag, stats]) => ({ tag, ...stats }));
}
