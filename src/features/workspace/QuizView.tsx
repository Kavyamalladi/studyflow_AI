import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { Button, Card, Progress } from '@/components/ui';

export function QuizView() {
  const currentSession = useStudyStore((state) => state.currentSession);
  const quizQuestions = currentSession?.quizQuestions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const currentQ = quizQuestions[currentIndex];

  if (!currentQ) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  if (isQuizComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    return (
      <Card className="mx-auto max-w-md p-8 text-center space-y-5 border-primary/30 shadow-glow">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Trophy className="size-8 animate-bounce" />
        </div>

        <h2 className="text-2xl font-extrabold text-foreground">Quiz Complete!</h2>

        <div className="space-y-1">
          <p className="text-3xl font-black text-primary">{percentage}% Score</p>
          <p className="text-xs text-muted-foreground">
            You answered {score} out of {quizQuestions.length} questions correctly.
          </p>
        </div>

        <Button onClick={handleRestartQuiz} className="w-full gap-2 font-bold rounded-xl">
          <RotateCcw className="size-4" /> Retake Quiz
        </Button>
      </Card>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-left">
      {/* Header Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-purple-500" />
          <h2 className="text-lg font-extrabold text-foreground">
            Practice Quiz (Question {currentIndex + 1} of {quizQuestions.length})
          </h2>
        </div>
        <span className="text-xs font-bold text-muted-foreground">Score: {score}</span>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {/* Question Card */}
      <Card className="p-6 space-y-5 border-border/80 shadow-soft">
        <h3 className="text-base font-bold tracking-tight text-foreground leading-snug">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let optionStyle = 'border-border/60 bg-card/40 hover:border-primary/50 hover:bg-secondary/60';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-destructive bg-destructive/10 text-destructive font-semibold';
              } else {
                optionStyle = 'border-border/30 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-xs text-left transition-all duration-200 focus-visible:outline-none ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border font-bold text-[11px]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{optionText}</span>
                </div>

                {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="size-4 text-destructive shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Feedback Rationale */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1.5"
          >
            <div className="font-bold text-primary flex items-center gap-1.5">
              <HelpCircle className="size-4" /> Rationale Explanation
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {currentQ.explanation}
            </p>
          </motion.div>
        )}

        {/* Next Question Control */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleNextQuestion} className="gap-2 font-bold rounded-xl">
              <span>{currentIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
