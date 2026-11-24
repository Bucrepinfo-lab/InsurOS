"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface UserMenuProps {
  name?: string;
  email?: string;
  avatar?: ReactNode;
  actions?: ReactNode;
}

/**
 * The person's name and their actions (theme, sign out). On wide screens the
 * actions sit in the bar; on phones they fold behind the avatar so nothing
 * spills off the screen.
 */
export function UserMenu({ name = 'User', email, avatar, actions }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !box.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const initial = avatar ?? name.slice(0, 1).toUpperCase();

  return (
    <div ref={box} className='relative flex items-center gap-3'>
      <div className='hidden text-right sm:block'>
        <p className='text-sm font-medium text-ink'>{name}</p>
        {email ? <p className='text-xs text-dim'>{email}</p> : null}
      </div>

      {/* Phones: the avatar opens the person's menu. */}
      <button
        type='button'
        aria-label={`Account menu for ${name}`}
        aria-expanded={open}
        aria-haspopup='true'
        onClick={() => setOpen((value) => !value)}
        className='flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper outline-none ring-sealbright/60 transition hover:ring-2 focus-visible:ring-2 sm:hidden'
      >
        {initial}
      </button>
      <div
        aria-hidden='true'
        className='hidden h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper sm:flex'
      >
        {initial}
      </div>

      {actions ? <div className='hidden items-center gap-2 sm:flex'>{actions}</div> : null}

      {open ? (
        <div
          role='menu'
          className='animate-rise absolute right-0 top-11 z-50 w-64 rounded-xl border border-line bg-sheet p-3 shadow-xl sm:hidden'
        >
          <div className='border-b border-line pb-2'>
            <p className='truncate text-sm font-medium text-ink'>{name}</p>
            {email ? <p className='truncate text-xs text-dim'>{email}</p> : null}
          </div>
          {actions ? <div className='flex flex-col items-stretch gap-2 pt-3 [&>*]:w-full'>{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
