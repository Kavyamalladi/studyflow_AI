import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/utils';
import { shadowSoft } from './styles';

type TriggerProps = HTMLAttributes<HTMLElement> & {
  'aria-describedby'?: string;
};

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  if (!isValidElement<TriggerProps>(children)) {
    return children;
  }

  const trigger = cloneElement(children, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      setOpen(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      setOpen(false);
    },
  });

  return (
    <span className="relative inline-flex">
      {trigger}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 max-w-xs rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium',
            shadowSoft,
            side === 'top'
              ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
              : 'top-full left-1/2 mt-2 -translate-x-1/2',
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
