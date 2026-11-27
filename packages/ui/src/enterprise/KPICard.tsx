import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

/** Owner 27/11/26 ("more colourful"): one colour per card so a page reads at a glance. */
const ACCENTS = {
  seal: { bar: 'linear-gradient(90deg, #17a37e, #0f6e56)', glow: 'rgba(15,110,86,0.14)', edge: '#0f6e56' },
  blue: { bar: 'linear-gradient(90deg, #4f8fe6, #1f5fbf)', glow: 'rgba(31,95,191,0.14)', edge: '#1f5fbf' },
  amber: { bar: 'linear-gradient(90deg, #f2b33d, #c9820a)', glow: 'rgba(201,130,10,0.16)', edge: '#c9820a' },
  plum: { bar: 'linear-gradient(90deg, #b06ad9, #7a3aa8)', glow: 'rgba(122,58,168,0.14)', edge: '#7a3aa8' },
} as const;

export interface KPICardProps {
  accent?: keyof typeof ACCENTS;
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
export function KPICard({ title, value, change, trend = 'neutral', icon, className, accent = 'seal' }: KPICardProps) {
  const tone = ACCENTS[accent];
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
        'border-t-[3px] transition-all duration-300 hover:-translate-y-1',
        'hover:shadow-[0_2px_4px_rgba(18,28,49,0.05),0_22px_44px_-18px_rgba(18,28,49,0.32)]',
        className
      )}
      style={{ borderTopColor: tone.edge }}
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100'
        style={{
          backgroundImage:
            `radial-gradient(closest-side, ${tone.glow}, transparent)`
        }}
      />
      <div
        className='mb-3 h-1 w-10 rounded-full'
        style={{ backgroundImage: tone.bar }}
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
