import type { ReactNode } from 'react';
import { cn } from '@/utils';

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div';
}

export function Section({ children, className, id, as: Tag = 'section' }: SectionProps) {
  return (
    <Tag id={id} className={cn('py-16 sm:py-20 lg:py-24', className)}>
      {children}
    </Tag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      className={cn(
        'mb-12 max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg text-muted">{description}</p> : null}
    </div>
  );
}
