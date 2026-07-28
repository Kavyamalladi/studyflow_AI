import { type ReactNode } from 'react';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–100
  color?: string;
  trackColor?: string;
  children?: ReactNode;
  className?: string;
}

export function ProgressRing({
  size = 80,
  strokeWidth = 6,
  progress,
  color = '#8b5cf6',
  trackColor = 'var(--color-border)',
  children,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
