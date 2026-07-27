import { Lightbulb, Sparkles, BookmarkCheck } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { Card } from '@/components/ui';

export function MnemonicsView() {
  const currentSession = useStudyStore((state) => state.currentSession);
  const mnemonics = currentSession?.mnemonics || [];

  if (!currentSession) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <Lightbulb className="size-5 text-amber-500" />
        <h2 className="text-lg font-extrabold text-foreground">
          Mnemonics & Memory Hooks
        </h2>
      </div>

      <div className="space-y-4">
        {mnemonics.map((item, idx) => (
          <Card key={idx} className="p-6 space-y-4 border-amber-500/30 bg-amber-500/5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="size-3" /> Memory Hook #{idx + 1}
              </span>
              <span className="text-xs font-bold text-foreground font-mono">
                {item.title}
              </span>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-card/80 p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Acronym / Phrase</span>
              <p className="mt-1 text-lg font-black tracking-wide text-amber-500">
                {item.acronymOrPhrase}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Acronym Breakdown
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {item.breakdown.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/60 p-2.5 text-xs font-medium text-foreground"
                  >
                    <BookmarkCheck className="size-3.5 text-amber-500 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
              <span className="font-bold text-foreground">Usage Tip: </span>
              {item.explanation}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
