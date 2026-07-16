import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  const tones = {
    neutral: 'bg-ink/[0.06] text-dim ring-1 ring-inset ring-ink/10',
    success: 'bg-sealsoft text-seal ring-1 ring-inset ring-seal/25',
    warning: 'bg-warnsoft text-warnink ring-1 ring-inset ring-warnink/25',
    danger: 'bg-dangersoft text-dangerink ring-1 ring-inset ring-dangerink/25'
  };

  const dots = {
    neutral: 'bg-faint',
    success: 'bg-sealbright shadow-[0_0_6px_rgba(23,163,126,0.7)]',
    warning: 'bg-warnink shadow-[0_0_6px_rgba(138,84,16,0.5)]',
    danger: 'bg-dangerink shadow-[0_0_6px_rgba(163,45,45,0.6)]'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[tone])} aria-hidden='true' />
      {children}
    </span>
  );
}
