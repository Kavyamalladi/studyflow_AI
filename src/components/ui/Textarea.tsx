import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';
import { fieldBase } from './styles';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, showCount, maxLength, value, ...props }, ref) => {
    const count = value !== undefined ? String(value).length : undefined;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'min-h-36 resize-none px-4 py-3 leading-relaxed',
            fieldBase,
            showCount && maxLength ? 'pb-10' : '',
            hasError ? 'border-destructive' : 'border-input',
            className,
          )}
          {...props}
        />
        {showCount && maxLength !== undefined && count !== undefined ? (
          <span
            className={cn(
              'pointer-events-none absolute right-4 bottom-3 text-xs tabular-nums',
              count >= maxLength ? 'text-destructive' : 'text-muted',
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {count}/{maxLength}
          </span>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
