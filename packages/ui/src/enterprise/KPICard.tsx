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
 * Ledger figure card: seal gradient rule, small-caps label, monospaced
 * value, soft radial highlight, hover lift.
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
        'group relative overflow-hidden rounded-2xl border border-line bg-sheet p-5',
        'shadow-[0_1px_2px_rgba(18,28,49,0.04),0_12px_32px_-20px_rgba(18,28,49,0.25)]',
        'transition-all duration-300 hover:-translate-y-0.5',
        'hover:shadow-[0_2px_4px_rgba(18,28,49,0.05),0_22px_44px_-18px_rgba(18,28,49,0.32)]',
        className
      )}
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100'
        style={{
          backgroundImage:
            'radial-gradient(closest-side, rgba(15,110,86,0.12), transparent)'
        }}
      />
      <div
        className='mb-3 h-1 w-10 rounded-full'
        style={{ backgroundImage: 'linear-gradient(90deg, #17a37e, #0f6e56)' }}
        aria-hidden='true'
      />
      <div className='relative flex items-start justify-between gap-4'>
        <div>
          <p className='text-[11px] font-medium uppercase tracking-[0.16em] text-dim'>
            {title}
          </p>
          <p className='mt-2 font-mono text-[28px] leading-none tracking-tight text-ink'>
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
