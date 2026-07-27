import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb, BookOpen, Clock } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { cn } from '@/utils';

// Rough reading-time estimate: 200 wpm
const wordsPerMinute = 200;
function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.ceil(words / wordsPerMinute);
  return mins < 1 ? '<1 min' : `${mins} min read`;
}

export function SummaryModule() {
  const session = useStudyStore((s) => s.currentSession);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  if (!session) return null;
  const sections = session.summarySections;
  const totalWords = sections.reduce((s, sec) => s + sec.content.trim().split(/\s+/).length, 0);

  const toggle = (i: number) =>
    setExpanded((e) => {
      const n = new Set(e);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const expandAll = () => setExpanded(new Set(sections.map((_, i) => i)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-white">Summary</h1>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-[#a1a1aa]">
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </div>
            <span className="text-[#52525b]">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              ~{Math.ceil(totalWords / wordsPerMinute)} min read
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#a1a1aa] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#a1a1aa] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const isOpen = expanded.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'overflow-hidden rounded-2xl border transition-colors duration-200',
                isOpen
                  ? 'border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.03)]'
                  : 'border-[rgba(255,255,255,0.07)] bg-[#18181b] hover:border-[rgba(255,255,255,0.12)]',
              )}
            >
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                {/* Number */}
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold transition-colors',
                    isOpen ? 'bg-[rgba(139,92,246,0.2)] text-[#8b5cf6]' : 'bg-[rgba(255,255,255,0.06)] text-[#71717a]',
                  )}
                >
                  {i + 1}
                </span>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">{section.title}</p>
                  <p className="mt-0.5 text-[12px] text-[#71717a]">{readingTime(section.content)}</p>
                </div>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  className="shrink-0"
                >
                  <ChevronDown className={cn('size-4 transition-colors', isOpen ? 'text-[#8b5cf6]' : 'text-[#52525b]')} />
                </motion.div>
              </button>

              {/* Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.06)] px-6 pb-6 pt-5">
                      {/* Main content */}
                      <p className="text-[14px] leading-[1.75] text-[#a1a1aa] whitespace-pre-line">
                        {section.content}
                      </p>

                      {/* Key Takeaway callout */}
                      {section.keyTakeaway && (
                        <div className="flex items-start gap-3 rounded-xl border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)] p-4">
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.2)]">
                            <Lightbulb className="size-3.5 text-[#8b5cf6]" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8b5cf6]">
                              Key Takeaway
                            </p>
                            <p className="mt-1 text-[13px] leading-relaxed text-white/80">
                              {section.keyTakeaway}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
