'use client';

import { useEffect, useState, useTransition } from 'react';
import type { ActionResult } from '@/lib/action-result';

export interface ActionButtonProps {
  label: string;
  action: () => Promise<ActionResult>;
  variant?: 'primary' | 'secondary';
}

/**
 * Runs a server action with full feedback: spinner while working, a brief
 * success state on the button, and a styled toast (seal for success,
 * danger for failure) that slides in bottom-right.
 */
export function ActionButton({ label, action, variant = 'primary' }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(null), 5500);
    return () => clearTimeout(timer);
  }, [result]);

  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal';

  const styles =
    variant === 'primary'
      ? flash
        ? 'bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)] text-white shadow-[0_2px_4px_rgba(15,110,86,0.3),0_10px_24px_-10px_rgba(15,110,86,0.55)]'
        : 'bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)]'
      : 'border border-ink/15 bg-sheet/60 text-ink hover:-translate-y-px hover:border-seal/50 hover:text-seal';

  return (
    <>
      <button
        type='button'
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(null);
            try {
              const outcome = await action();
              setResult(outcome);
              if (outcome.ok) {
                setFlash(true);
                setTimeout(() => setFlash(false), 1200);
              }
            } catch {
              setResult({
                ok: false,
                title: 'Action failed',
                message: 'Something went wrong — try again'
              });
            }
          })
        }
        className={`${base} ${styles}`}
      >
        {pending ? (
          <>
            <span
              aria-hidden='true'
              className='animate-spin-slow inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent'
            />
            Working…
          </>
        ) : flash ? (
          <>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
              <path d='M4 12.5 9.5 18 20 6.5' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            Done
          </>
        ) : (
          label
        )}
      </button>

      {result ? (
        <div
          role='status'
          className='animate-toast fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-xl px-4 py-3.5 text-sm text-white shadow-[0_18px_44px_-14px_rgba(6,30,25,0.6)]'
          style={{
            backgroundImage: result.ok
              ? 'linear-gradient(135deg, #0a4a3c 0%, #06382f 100%)'
              : 'linear-gradient(135deg, #8f2626 0%, #6e1c1c 100%)'
          }}
        >
          <span
            aria-hidden='true'
            className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15'
          >
            {result.ok ? (
              <svg width='11' height='11' viewBox='0 0 24 24' fill='none'>
                <path d='M4 12.5 9.5 18 20 6.5' stroke='white' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            ) : (
              <svg width='11' height='11' viewBox='0 0 24 24' fill='none'>
                <path d='M12 5v9m0 4v.5' stroke='white' strokeWidth='3.5' strokeLinecap='round' />
              </svg>
            )}
          </span>
          <span className='min-w-0 leading-snug'>
            <span className='flex flex-wrap items-center gap-2'>
              <span className='font-display text-[15px]'>{result.title}</span>
              {result.reference ? (
                <span className='rounded-md bg-white/12 px-1.5 py-0.5 font-mono text-[10.5px] tracking-tight text-white/85'>
                  {result.reference}
                </span>
              ) : null}
            </span>
            <span className='mt-0.5 block text-[12.5px] text-white/80'>{result.message}</span>
            <span className='mt-1.5 block text-[10px] uppercase tracking-[0.16em] text-white/45'>
              {result.ok ? 'Receipt' : 'Attention'} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>
          <button
            type='button'
            aria-label='Dismiss'
            onClick={() => setResult(null)}
            className='ml-1 mt-0.5 text-white/50 transition hover:text-white'
          >
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
              <path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
