import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookmarkPlus,
  Layers,
  Check,
} from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { Button, Progress } from '@/components/ui';

export function FlashcardsView() {
  const currentSession = useStudyStore((state) => state.currentSession);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  const flashcards = currentSession?.flashcards || [];
  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length]);

  if (!currentCard) return null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleReview = (id: string) => {
    setReviewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isMastered = masteredIds.includes(currentCard.id);
  const isNeedsReview = reviewIds.includes(currentCard.id);

  const progressPercent = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-center">
      {/* Header Controls & Deck Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-indigo-500" />
          <h2 className="text-lg font-extrabold text-foreground">
            Flashcard Deck ({currentIndex + 1} / {flashcards.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
            {masteredIds.length} Mastered
          </span>
          <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500">
            {reviewIds.length} Review Later
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span>{progressPercent}% Deck Complete</span>
        </div>
      </div>

      {/* 3D Interactive Flip Card */}
      <div className="[perspective:1000px] my-4 min-h-[320px] w-full">
        <motion.div
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative min-h-[320px] w-full cursor-pointer rounded-2xl [transform-style:preserve-3d]"
        >
          {/* Card Front (Question) */}
          <div
            className={`glass absolute inset-0 flex flex-col justify-between rounded-2xl border border-border/80 p-8 shadow-soft [backface-visibility:hidden] ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-md bg-secondary px-2 py-0.5 font-bold uppercase tracking-wider text-muted-foreground">
                {currentCard.tag}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <RotateCw className="size-3 text-muted" /> Click or Space to flip
              </span>
            </div>

            <div className="my-auto py-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex justify-center text-xs font-semibold text-primary">
              Flip to reveal answer →
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div
            className={`glass absolute inset-0 flex flex-col justify-between rounded-2xl border border-primary/40 bg-card/90 p-8 shadow-glow [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-md bg-primary/20 px-2 py-0.5 font-bold uppercase tracking-wider text-primary">
                Answer Key
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <RotateCw className="size-3" /> Click to flip back
              </span>
            </div>

            <div className="my-auto py-6 text-left">
              <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-foreground">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground">Rate your recall:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReview(currentCard.id);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    isNeedsReview
                      ? 'bg-amber-500 text-white'
                      : 'border border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <BookmarkPlus className="size-3.5" /> Review Later
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered(currentCard.id);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    isMastered
                      ? 'bg-emerald-500 text-white'
                      : 'border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  <Check className="size-3.5" /> Got it!
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          className="gap-1 text-xs font-bold rounded-xl"
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <kbd className="rounded bg-secondary px-1.5 py-0.5">←</kbd>
          <kbd className="rounded bg-secondary px-1.5 py-0.5">→</kbd> Navigate
          <kbd className="ml-2 rounded bg-secondary px-1.5 py-0.5">Space</kbd> Flip
        </div>

        <Button
          onClick={handleNext}
          className="gap-1 text-xs font-bold rounded-xl"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
