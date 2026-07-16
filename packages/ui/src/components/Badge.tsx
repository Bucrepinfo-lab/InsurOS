import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  const tones = {
    neutral: 'bg-ink/5 text-dim',
    success: 'bg-sealsoft text-seal',
    warning: 'bg-warnsoft text-warnink',
    danger: 'bg-dangersoft text-dangerink'
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
