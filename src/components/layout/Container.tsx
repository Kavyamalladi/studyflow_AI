import type { ReactNode } from 'react';
import { cn } from '@/utils';

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
} as const;

export interface ContainerProps {
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
}

export function Container({ children, size = 'lg', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}>
      {children}
    </div>
  );
}
