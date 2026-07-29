import {
  useRef, useState, useCallback,
  type DragEvent, type ChangeEvent, type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Sparkles, ArrowRight, Clock, RotateCcw, FileText } from 'lucide-react';
import { SUBJECT_CHIPS } from '@/constants/subjects';
import { useStudyStore } from '@/store/study.store';
import { cn } from '@/utils';


const SUBJECT_CHIPS_SHOWN = SUBJECT_CHIPS.slice(0, 7);

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const DIFFICULTY_DOT: Record<string, string> = {
  Beginner:     'bg-[#22c55e]',
  Intermediate: 'bg-[#f59e0b]',
  Advanced:     'bg-[#ef4444]',
};

export function HomeView() {
  const notes           = useStudyStore((s) => s.notes);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const autosavedAt     = useStudyStore((s) => s.autosavedAt);
  const recentSessions  = useStudyStore((s) => s.recentSessions);
  const setNotes        = useStudyStore((s) => s.setNotes);
  const selectSubject   = useStudyStore((s) => s.selectSubject);
  const clearNotes      = useStudyStore((s) => s.clearNotes);
  const beginGeneration = useStudyStore((s) => s.beginGeneration);
  const setShortcutsOpen = useStudyStore((s) => s.setShortcutsOpen);

  const [isDragging, setIsDragging] = useState(false);
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);
  const fileRef     = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canGenerate = notes.trim().length > 10;
  const showDraftBanner = !draftBannerDismissed && autosavedAt && notes.length > 30;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && canGenerate) {
        e.preventDefault();
        beginGeneration();
      }
    },
    [canGenerate, beginGeneration],
  );

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
    else {
      const text = e.dataTransfer.getData('text');
      if (text) setNotes(text);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) setNotes(text);
    };
    reader.readAsText(file);
  };

  const restoreSession = (session: { subjectId: string | null; notes: string }) => {
    if (session.subjectId) {
      selectSubject(session.subjectId);
    } else {
      setNotes(session.notes);
    }
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-4 py-8">
      <div className="w-full max-w-[640px] space-y-6">

        {/* ── Logo + headline ── */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)] px-3 py-1">
            <Sparkles className="size-3 text-[#8b5cf6]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b5cf6]">AI Study Workspace</span>
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-white">StudyFlow AI</h1>
          <p className="mx-auto max-w-xs text-[14px] leading-relaxed text-[#a1a1aa]">
            Paste your notes and instantly generate an interactive study workspace.
          </p>
        </div>

        {/* ── Draft restore banner ── */}
        <AnimatePresence>
          {showDraftBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] px-4 py-2.5">
                <RotateCcw className="size-3.5 shrink-0 text-[#8b5cf6]" />
                <p className="flex-1 text-[12px] text-[#a1a1aa]">
                  Draft restored from <span className="text-white">{timeAgo(autosavedAt!)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setDraftBannerDismissed(true)}
                  className="text-[#71717a] transition-colors hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Editor ── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-2xl border transition-all duration-200',
            isDragging
              ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.06)] shadow-[0_0_0_2px_rgba(139,92,246,0.2)]'
              : notes
                ? 'border-[rgba(255,255,255,0.1)] bg-[#18181b] focus-within:border-[rgba(139,92,246,0.4)] focus-within:shadow-[0_0_0_2px_rgba(139,92,246,0.1)]'
                : 'border-[rgba(255,255,255,0.07)] bg-[#18181b] hover:border-[rgba(255,255,255,0.12)]',
          )}
        >
          {/* Drag overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-[rgba(9,9,11,0.8)] backdrop-blur-sm"
              >
                <Upload className="size-8 text-[#8b5cf6]" />
                <p className="text-[14px] font-semibold text-white">Drop to import</p>
                <p className="text-[12px] text-[#a1a1aa]">Supports .txt, .md, .pdf</p>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={8}
            placeholder={`Paste your lecture notes, textbook excerpt, or study topic here…\n\nExample:\n  Process Synchronization — Critical Section Problem\n  • Mutual Exclusion: only one process in CS at a time\n  • Progress: selection cannot be postponed indefinitely\n  • Bounded Waiting: limit on how many times others enter CS`}
            className="w-full resize-none rounded-2xl bg-transparent px-5 py-4 text-[14px] leading-relaxed text-white placeholder:text-[#3f3f46] focus:outline-none"
            aria-label="Study notes input"
            spellCheck={false}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.pdf,.json,.csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#71717a] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
              >
                <Upload className="size-3.5" />
                Import file
              </button>
              {notes && (
                <button
                  type="button"
                  onClick={clearNotes}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#71717a] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[#ef4444]"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="tabular-nums text-[12px] text-[#52525b]">
                {notes.length.toLocaleString()} chars
              </span>
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="hidden items-center gap-1 text-[11px] text-[#52525b] transition-colors hover:text-[#a1a1aa] sm:flex"
              >
                <kbd className="kbd">↵</kbd>
                <span className="ml-1">to generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Subject chips ── */}
        <div className="space-y-2.5">
          <p className="text-center text-[11px] font-medium uppercase tracking-wider text-[#52525b]">
            Or start from a subject
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUBJECT_CHIPS_SHOWN.map((subject) => {
              const isSelected = selectedSubjectId === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => selectSubject(subject.id)}
                  className={cn(
                    'rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all duration-150',
                    isSelected
                      ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] shadow-[0_0_0_1px_rgba(139,92,246,0.2)]'
                      : 'border-[rgba(255,255,255,0.07)] bg-[#18181b] text-[#a1a1aa] hover:border-[rgba(255,255,255,0.14)] hover:text-white',
                  )}
                >
                  {subject.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Generate button ── */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={beginGeneration}
            disabled={!canGenerate}
            className={cn(
              'group inline-flex h-11 items-center gap-2.5 rounded-xl px-7 text-[14px] font-semibold transition-all duration-200',
              canGenerate
                ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.5),0_8px_28px_rgba(139,92,246,0.4)] active:scale-[0.98]'
                : 'cursor-not-allowed bg-[rgba(255,255,255,0.05)] text-[#52525b]',
            )}
          >
            Generate study workspace
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* ── Recent sessions ── */}
        {recentSessions.length > 0 && (
          <div className="space-y-2.5 border-t border-[rgba(255,255,255,0.06)] pt-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#52525b]">
              Recent sessions
            </p>
            <div className="space-y-1.5">
              {recentSessions.slice(0, 3).map((session) => (
                <motion.button
                  key={session.id}
                  type="button"
                  onClick={() => restoreSession(session)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.12 }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#18181b] px-4 py-3 text-left transition-colors hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)]">
                    <FileText className="size-4 text-[#71717a]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-white">{session.name}</span>
                      <span className={cn('size-1.5 shrink-0 rounded-full', DIFFICULTY_DOT[session.difficulty] ?? 'bg-[#71717a]')} />
                    </div>
                    <p className="text-[11px] text-[#52525b]">{session.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#52525b]">
                    <Clock className="size-3" />
                    {timeAgo(session.timestamp)}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
