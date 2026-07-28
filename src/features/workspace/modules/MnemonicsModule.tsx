import { Zap } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';

export function MnemonicsModule() {
  const session = useStudyStore((s) => s.currentSession);
  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <div>
        <h1 className="t-section">Mnemonics</h1>
        <p className="t-label mt-0.5">Memory hooks to accelerate recall</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {session.mnemonics.map((m, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-border)] bg-surface p-6 space-y-4"
          >
            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.15)]">
                <Zap className="size-4 text-primary" />
              </div>
              <h3 className="text-[14px] font-semibold text-foreground">{m.title}</h3>
            </div>

            {/* Acronym */}
            <div className="rounded-xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] p-4">
              <p className="text-center font-mono text-[22px] font-bold tracking-[0.15em] text-primary break-words">
                {m.acronymOrPhrase}
              </p>
            </div>

            {/* Breakdown */}
            <ul className="space-y-2">
              {m.breakdown.map((line, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 font-mono text-[13px] font-bold text-primary">
                    {line.split('—')[0].trim()}
                  </span>
                  <span className="t-body text-muted break-words min-w-0">
                    {line.includes('—') ? line.split('—').slice(1).join('—').trim() : ''}
                  </span>
                </li>
              ))}
            </ul>

            {/* Explanation */}
            {m.explanation && (
              <p className="t-caption border-t border-[var(--color-border)] pt-3 text-muted-foreground">
                {m.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
