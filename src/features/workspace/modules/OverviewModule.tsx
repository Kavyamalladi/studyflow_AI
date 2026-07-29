
import { motion } from 'framer-motion';
import {
  Clock, Target, Layers, CheckCircle, Zap, AlignLeft,
  TrendingUp, BarChart2, Flame,
} from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { ProgressRing } from '../components/ProgressRing';


const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Beginner:     { label: 'Beginner',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Advanced:     { label: 'Advanced',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const QUICK_MODULES = [
  { tab: 'flashcards' as const, icon: Layers,      label: 'Flashcards',  desc: 'Active recall' },
  { tab: 'quiz'       as const, icon: CheckCircle, label: 'Quiz',        desc: 'Test yourself' },
  { tab: 'summary'   as const, icon: AlignLeft,   label: 'Summary',     desc: 'Key concepts' },
  { tab: 'mnemonics' as const, icon: Zap,          label: 'Mnemonics',   desc: 'Memory hooks' },
];

export function OverviewModule() {
  const session           = useStudyStore((s) => s.currentSession);
  const setActiveTab      = useStudyStore((s) => s.setActiveTab);
  const flashcardProgress = useStudyStore((s) => s.flashcardProgress);
  const quizProgress      = useStudyStore((s) => s.quizProgress);

  // Compute real progress from actual user activity
  const totalCards     = session?.flashcards.length ?? 0;
  const totalQuestions = session?.quizQuestions.length ?? 0;

  const cardPct  = totalCards     > 0 ? (flashcardProgress.seenCount / totalCards)     * 100 : 0;
  const quizPct  = totalQuestions > 0 && quizProgress ? (quizProgress.score / totalQuestions) * 100 : 0;

  // Weighted: flashcards 60%, quiz 40% (or 100% flashcards if no quiz done yet)
  const progress = quizProgress
    ? Math.round(cardPct * 0.6 + quizPct * 0.4)
    : Math.round(cardPct);

  const clampedProgress = Math.min(100, Math.max(0, progress));

  if (!session) return null;
  const diff = DIFFICULTY_CONFIG[session.difficulty] ?? DIFFICULTY_CONFIG.Intermediate;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8">

      {/* ── Title Row ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#a1a1aa]">
            {session.category}
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-tight text-white leading-tight">
            {session.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* Difficulty badge */}
            <span
              className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
              style={{ color: diff.color, background: diff.bg }}
            >
              {diff.label}
            </span>
            {/* Time */}
            <div className="flex items-center gap-1.5 text-[13px] text-[#a1a1aa]">
              <Clock className="size-3.5" />
              {session.estimatedMinutes} min
            </div>
            {/* Cards */}
            <div className="flex items-center gap-1.5 text-[13px] text-[#a1a1aa]">
              <Layers className="size-3.5" />
              {session.flashcards.length} cards
            </div>
            {/* Questions */}
            <div className="flex items-center gap-1.5 text-[13px] text-[#a1a1aa]">
              <CheckCircle className="size-3.5" />
              {session.quizQuestions.length} questions
            </div>
          </div>
        </div>

        {/* Progress ring */}
        <ProgressRing size={80} strokeWidth={6} progress={clampedProgress} className="shrink-0 sm:mt-1">
          <div className="text-center">
            <span className="block text-[16px] font-bold text-white">{clampedProgress}%</span>
            <span className="block text-[9px] text-[#71717a] uppercase tracking-wide">done</span>
          </div>
        </ProgressRing>
      </div>

      {/* ── Progress bar ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#a1a1aa]">Session progress</span>
          <span className="text-[12px] font-semibold text-white">{clampedProgress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <motion.div
            className="h-full rounded-full bg-[#8b5cf6]"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* ── Quick Action Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_MODULES.map(({ tab, icon: Icon, label, desc }, i) => (
          <motion.button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-5 text-left transition-all duration-200 hover:border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)]"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.1)] transition-colors group-hover:bg-[rgba(139,92,246,0.2)]">
              <Icon className="size-4 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">{label}</p>
              <p className="text-[11px] text-[#71717a]">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Bottom row: Objectives + Weak Topics + Activity ── */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Learning Objectives — takes 3 cols */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Target className="size-4 text-[#8b5cf6]" />
            <h2 className="text-[14px] font-semibold text-white">Learning Objectives</h2>
          </div>
          <ul className="space-y-3">
            {session.learningObjectives.map((obj, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[rgba(139,92,246,0.35)] text-[11px] font-bold text-[#8b5cf6]">
                  {i + 1}
                </div>
                <p className="text-[13px] leading-relaxed text-[#a1a1aa]">{obj}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right column — Weak Topics + Recent Activity — 2 cols */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Cards seen */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Flame className="size-4 text-[#f59e0b]" />
              <h2 className="text-[14px] font-semibold text-white">Flashcard Progress</h2>
            </div>
            <p className="text-[24px] font-bold text-white">
              {flashcardProgress.seenCount}
              <span className="text-[14px] font-normal text-[#71717a]"> / {totalCards}</span>
            </p>
            <p className="mt-1 text-[12px] text-[#a1a1aa]">cards reviewed</p>
          </div>

          {/* Quiz score */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-[#8b5cf6]" />
              <h2 className="text-[14px] font-semibold text-white">Quiz Score</h2>
            </div>
            {quizProgress ? (
              <>
                <p className="text-[24px] font-bold text-white">
                  {quizProgress.score}
                  <span className="text-[14px] font-normal text-[#71717a]"> / {quizProgress.total}</span>
                </p>
                <p className="mt-1 text-[12px] text-[#a1a1aa]">correct answers</p>
              </>
            ) : (
              <p className="text-[13px] text-[#52525b]">Not attempted yet</p>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-6">
        <div className="mb-2 flex items-center gap-2">
          <BarChart2 className="size-4 text-[#8b5cf6]" />
          <h2 className="text-[14px] font-semibold text-white">About This Session</h2>
        </div>
        <p className="text-[14px] leading-relaxed text-[#a1a1aa]">{session.description}</p>
      </div>
    </div>
  );
}
