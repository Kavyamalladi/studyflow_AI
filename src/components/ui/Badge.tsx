import type { HTMLAttributes } from 'react';
import { cn } from '@/utils';

const variants = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-accent text-accent-foreground',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  outline: 'border border-border bg-transparent text-foreground',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
