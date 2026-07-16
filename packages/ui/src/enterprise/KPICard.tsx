import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

/**
 * Ledger-style figure card: small-caps label, monospaced value (money and
 * counts read as exact), seal tick rule on top.
 */
export function KPICard({ title, value, change, trend = 'neutral', icon, className }: KPICardProps) {
  const trendClass = {
    up: 'text-seal',
    down: 'text-dangerink',
    neutral: 'text-dim'
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-sheet p-5 shadow-[0_1px_2px_rgba(27,42,65,0.05)]',
        className
      )}
    >
      <div className='mb-3 h-0.5 w-8 rounded bg-seal' aria-hidden='true' />
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-[11px] font-medium uppercase tracking-[0.14em] text-dim'>
            {title}
          </p>
          <p className='mt-2 font-mono text-[26px] leading-none tracking-tight text-ink'>
            {value}
          </p>
          {change ? (
            <p className={cn('mt-2.5 text-[12px]', trendClass[trend])}>{change}</p>
          ) : null}
        </div>
        {icon ? <div className='text-faint'>{icon}</div> : null}
      </div>
    </div>
  );
}
