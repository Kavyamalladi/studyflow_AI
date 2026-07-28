import { motion } from 'framer-motion';
import { Award, Clock, Layers, CheckCircle, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { ProgressRing } from '../components/ProgressRing';

// ── Mock analytics data (in a real app this comes from session tracking) ──
const MOCK_ACCURACY = 72;
const MOCK_CARDS_REVIEWED = 4;
const MOCK_TIME_SPENT = 8; // minutes
const MOCK_STREAK = 3;

interface TagStat { tag: string; correct: number; total: number }
const MOCK_TAG_STATS: TagStat[] = [
  { tag: 'Process Sync',    correct: 3, total: 4 },
  { tag: 'Deadlocks',       correct: 2, total: 4 },
  { tag: 'Semaphores',      correct: 4, total: 4 },
  { tag: 'Algorithms',      correct: 1, total: 3 },
];

interface BarProps { label: string; value: number; max: number; color: string }
function HBar({ label, value, max, color }: BarProps) {
  const pct = Math.round((value / max) * 100);
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
  if (!session) return null;

  const weakTopics = MOCK_TAG_STATS
    .filter((t) => t.correct / t.total < 0.6)
    .map((t) => t.tag);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--color-foreground)]">Analytics</h1>
        <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">Session performance overview</p>
      </div>

      {/* ── Top stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Accuracy',       value: `${MOCK_ACCURACY}%`, icon: TrendingUp, accent: true },
          { label: 'Cards reviewed', value: String(MOCK_CARDS_REVIEWED), icon: Layers,      accent: false },
          { label: 'Time spent',     value: `${MOCK_TIME_SPENT}m`,       icon: Clock,       accent: false },
          { label: 'Day streak',     value: `${MOCK_STREAK}d`,           icon: Award,       accent: false },
        ].map(({ label, value, icon: Icon, accent }, i) => (
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
          </motion.div>
        ))}
      </div>

      {/* ── Main content: accuracy ring + tag bars ── */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Accuracy ring card */}
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 lg:col-span-2">
          <ProgressRing size={120} strokeWidth={9} progress={MOCK_ACCURACY}>
            <div className="text-center">
              <span className="block text-[26px] font-bold text-[var(--color-foreground)]">{MOCK_ACCURACY}%</span>
              <span className="block text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">accuracy</span>
            </div>
          </ProgressRing>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-[var(--color-foreground)]">
              {MOCK_ACCURACY >= 80 ? 'Excellent' : MOCK_ACCURACY >= 60 ? 'Good progress' : 'Needs work'}
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--color-muted-foreground)]">Based on quiz performance</p>
          </div>
        </div>

        {/* Performance by topic */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 className="size-4 text-[#8b5cf6]" />
            <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Performance by Topic</h2>
          </div>
          <div className="space-y-4">
            {MOCK_TAG_STATS.map(({ tag, correct, total }) => {
              const pct = correct / total;
              const color = pct >= 0.8 ? '#22c55e' : pct >= 0.5 ? '#8b5cf6' : '#ef4444';
              return <HBar key={tag} label={tag} value={correct} max={total} color={color} />;
            })}
          </div>
        </div>
      </div>

      {/* ── Content breakdown ── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle className="size-4 text-[#8b5cf6]" />
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Session Content</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Flashcards',        count: session.flashcards.length,      cap: 20, color: '#8b5cf6' },
            { label: 'Quiz Questions',    count: session.quizQuestions.length,   cap: 20, color: '#22c55e' },
            { label: 'Summary Sections',  count: session.summarySections.length, cap: 10, color: '#f59e0b' },
            { label: 'Mnemonics',         count: session.mnemonics.length,       cap: 10, color: '#3b82f6' },
          ].map(({ label, count, cap, color }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-36 shrink-0 text-[13px] text-[var(--color-muted)]">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / cap) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                />
              </div>
              <span className="w-6 text-right text-[13px] font-semibold text-[var(--color-foreground)]">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weak topics ── */}
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

      {/* ── Learning objectives status ── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-foreground)]">Objectives Status</h2>
        <ul className="space-y-3">
          {session.learningObjectives.map((obj, i) => {
            // Mock: first 2 completed if accuracy > 60
            const done = MOCK_ACCURACY >= 60 && i < 2;
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
                    : <span className="size-1.5 rounded-full bg-[#52525b]" />
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
