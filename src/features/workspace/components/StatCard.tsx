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
        'rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#18181b] p-5',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mb-3 flex size-9 items-center justify-center rounded-lg',
            accent ? 'bg-[rgba(139,92,246,0.15)]' : 'bg-[rgba(255,255,255,0.05)]',
          )}
        >
          <Icon className={cn('size-4', accent ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]')} />
        </div>
      )}
      <p className="text-[12px] font-medium text-[#a1a1aa]">{label}</p>
      <p className="mt-0.5 text-[24px] font-bold tracking-tight text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-[#71717a]">{sub}</p>}
    </div>
  );
}
