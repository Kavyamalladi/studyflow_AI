import {
  useRef, useState, useCallback,
  type DragEvent, type ChangeEvent, type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Sparkles, ArrowRight, Clock, RotateCcw, FileText } from 'lucide-react';
import { SUBJECT_CHIPS } from '@/constants/subjects';
import { useStudyStore } from '@/store/study.store';
import { cn } from '@/utils';

const MAX_CHARS = 3000;
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate) {
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
      if (text) setNotes(text.slice(0, MAX_CHARS));
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
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] space-y-6">

        {/* ── Logo + headline ── */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)] px-3 py-1">
            <Sparkles className="size-3 text-[var(--color-primary)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">AI Study Workspace</span>
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[var(--color-foreground)]">StudyFlow AI</h1>
          <p className="mx-auto max-w-xs text-[14px] leading-relaxed text-[var(--color-muted)]">
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
                <RotateCcw className="size-3.5 shrink-0 text-[var(--color-primary)]" />
                <p className="flex-1 text-[12px] text-[var(--color-muted)]">
                  Draft restored from <span className="text-[var(--color-foreground)]">{timeAgo(autosavedAt!)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setDraftBannerDismissed(true)}
                  className="text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
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
              ? 'border-[var(--color-primary)] bg-[rgba(139,92,246,0.06)] shadow-[0_0_0_2px_rgba(139,92,246,0.2)]'
              : notes
                ? 'border-[var(--color-input)] bg-[var(--color-surface)] focus-within:border-[rgba(139,92,246,0.4)] focus-within:shadow-[0_0_0_2px_rgba(139,92,246,0.1)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-input)]',
          )}
        >
          {/* Drag overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--color-background)]/80 backdrop-blur-sm"
              >
                <Upload className="size-8 text-[var(--color-primary)]" />
                <p className="text-[14px] font-semibold text-[var(--color-foreground)]">Drop to import</p>
                <p className="text-[12px] text-[var(--color-muted)]">Supports .txt, .md, .pdf</p>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            rows={8}
            placeholder={`Paste your lecture notes, textbook excerpt, or study topic here…\n\nExample:\n  Process Synchronization — Critical Section Problem\n  • Mutual Exclusion: only one process in CS at a time\n  • Progress: selection cannot be postponed indefinitely\n  • Bounded Waiting: limit on how many times others enter CS`}
            className="w-full resize-none rounded-2xl bg-transparent px-5 py-4 text-[14px] leading-relaxed text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none"
            aria-label="Study notes input"
            spellCheck={false}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2.5">
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
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-input)] hover:text-[var(--color-foreground)]"
              >
                <Upload className="size-3.5" />
                Import file
              </button>
              {notes && (
                <button
                  type="button"
                  onClick={clearNotes}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-input)] hover:text-[var(--color-destructive)]"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                'tabular-nums text-[12px]',
                notes.length > MAX_CHARS * 0.9 ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted-foreground)]',
              )}>
                {notes.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="hidden items-center gap-1 text-[11px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-muted)] sm:flex"
              >
                <kbd className="kbd">⌘</kbd>
                <kbd className="kbd">↵</kbd>
                <span className="ml-1">to generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Subject chips ── */}
        <div className="space-y-2.5">
          <p className="text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Or start from a subject
          </p>
          <div className="flex flex-wrap justify-center gap-2">
              {SUBJECT_CHIPS_SHOWN.map((subject) => {
              const isSelected = selectedSubjectId === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => selectSubject(subject.id!)}
                  className={cn(
                    'rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all duration-150',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[rgba(139,92,246,0.12)] text-[var(--color-primary)] shadow-[0_0_0_1px_rgba(139,92,246,0.2)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-input)] hover:text-[var(--color-foreground)]',
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
                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.5),0_8px_28px_rgba(139,92,246,0.4)] active:scale-[0.98]'
                : 'cursor-not-allowed bg-[var(--color-input)] text-[var(--color-muted-foreground)]',
            )}
          >
            Generate study workspace
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* ── Recent sessions ── */}
        {recentSessions.length > 0 && (
          <div className="space-y-2.5 border-t border-[var(--color-border)] pt-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
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
                  className="group flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--color-input)] hover:bg-[var(--color-card)]"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-input)]">
                    <FileText className="size-4 text-[var(--color-muted-foreground)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-[var(--color-foreground)]">{session.name}</span>
                      <span className={cn('size-1.5 shrink-0 rounded-full', DIFFICULTY_DOT[session.difficulty] ?? 'bg-[var(--color-muted-foreground)]')} />
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">{session.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-[var(--color-muted-foreground)]">
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
