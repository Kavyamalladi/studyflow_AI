import { FileText, CheckCircle2 } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { Card } from '@/components/ui';

export function SummaryView() {
  const currentSession = useStudyStore((state) => state.currentSession);
  const summarySections = currentSession?.summarySections || [];

  if (!currentSession) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <FileText className="size-5 text-emerald-500" />
        <h2 className="text-lg font-extrabold text-foreground">
          Structured Study Summary
        </h2>
      </div>

      {/* Raw Notes Card */}
      <Card className="p-6 space-y-4 border-border/80 shadow-soft">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Source Study Notes
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {currentSession.sampleNotes?.length ?? 0} characters
          </span>
        </div>
        <div className="whitespace-pre-line text-xs font-mono leading-relaxed text-foreground/90 bg-secondary/30 p-4 rounded-xl border border-border/40">
          {currentSession.sampleNotes}
        </div>
      </Card>

      {/* Extracted Key Summary Topics */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Extracted Key Topics & Takeaways
        </h3>

        {summarySections.map((sec, idx) => (
          <Card key={idx} className="p-6 space-y-3 border-border/60 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                {idx + 1}
              </span>
              <span>{sec.title}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {sec.content}
            </p>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1">
              <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> Key Takeaway
              </span>
              <p className="text-foreground/90 font-medium">
                {sec.keyTakeaway}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
