'use client';

import { useState, useTransition } from 'react';

export interface ActionButtonProps {
  label: string;
  action: () => Promise<string | void>;
  variant?: 'primary' | 'secondary';
}

/**
 * Runs a server action with pending/result feedback. Used to wire every
 * primary page action to its real engine against the demo dataset.
 */
export function ActionButton({ label, action, variant = 'primary' }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const classes =
    variant === 'primary'
      ? 'bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)]'
      : 'border border-ink/15 bg-sheet/60 text-ink hover:-translate-y-px hover:border-seal/50 hover:text-seal';

  return (
    <span className='relative inline-flex flex-col items-end'>
      <button
        type='button'
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            try {
              const result = await action();
              setMessage(typeof result === 'string' ? result : 'Done');
            } catch {
              setMessage('Something went wrong — try again');
            }
            setTimeout(() => setMessage(null), 4000);
          })
        }
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-60 ${classes}`}
      >
        {pending ? 'Working…' : label}
      </button>
      {message ? (
        <span className='absolute top-full mt-1.5 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] text-paper shadow-lg'>
          {message}
        </span>
      ) : null}
    </span>
  );
}
