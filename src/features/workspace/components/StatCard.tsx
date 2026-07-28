import { cn } from '@/utils';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, sub, icon: Icon, accent, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mb-3 flex size-9 items-center justify-center rounded-lg',
            accent ? 'bg-[rgba(139,92,246,0.15)]' : 'bg-[var(--color-input)]',
          )}
        >
          <Icon className={cn('size-4', accent ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]')} />
        </div>
      )}
      <p className="text-[12px] font-medium text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-[var(--color-muted-foreground)]">{sub}</p>}
    </div>
  );
}
