import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';
import { shadowSoft } from './styles';
import { Spinner } from './Spinner';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80',
  ghost: 'bg-transparent text-foreground hover:bg-secondary',
  outline: 'border border-border bg-transparent hover:bg-secondary',
  destructive: 'bg-destructive text-destructive-foreground hover:brightness-110',
} as const;

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'size-10 p-0',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && shadowSoft,
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" label="Loading" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';
