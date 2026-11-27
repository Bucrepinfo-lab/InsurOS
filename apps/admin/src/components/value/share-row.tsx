'use client';

import { useState } from 'react';
import { COPIED_HINT, shareTargets } from '@insuros/domain';

/**
 * The share row, always open (owner 27/11/26, from the Stawi row he likes):
 * WhatsApp, Facebook, X, Telegram, LinkedIn, Text message and Email in their
 * own colours, then "TikTok, Instagram & more" (the phone's share sheet on a
 * phone; on a computer it copies the link with a hint) and Copy link. For
 * PUBLIC pages only; private links keep the one-to-one ShareButton.
 */
export function ShareRow({ title, text, url, label = 'Tell another agency' }: { title: string; text: string; url: string; label?: string }) {
  const [note, setNote] = useState('');

  async function copy(hint = 'Link copied') {
    try {
      await navigator.clipboard.writeText(url);
      setNote(hint);
    } catch {
      setNote(url);
    }
    window.setTimeout(() => setNote(''), 4000);
  }

  async function more() {
    const touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (!(touch && typeof navigator.share === 'function')) return copy(COPIED_HINT);
    try {
      await navigator.share({ title, text, url });
    } catch {
      // Closed the sheet: nothing to do.
    }
  }

  const chip =
    'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition duration-150 hover:-translate-y-px hover:shadow-md hover:brightness-105 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal motion-reduce:transform-none motion-reduce:transition-none';

  return (
    <div role='group' aria-label={label} className='flex flex-wrap items-center gap-2'>
      <p className='flex w-full items-center gap-2 text-[15px] font-semibold text-ink sm:w-auto sm:pr-2'>
        <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className='text-[#c9a227]'>
          <path d='M3 10v4h3l6 4V6L6 10H3Z' fill='currentColor' fillOpacity='.3' />
          <path d='M16 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11' />
        </svg>
        {label}
      </p>
      {shareTargets({ title, text, url }).map((target) => (
        <a
          key={target.id}
          href={target.href}
          target={target.href.startsWith('http') ? '_blank' : undefined}
          rel='noopener noreferrer'
          className={`${chip} text-white`}
          style={{ background: target.color, borderColor: target.color }}
        >
          {target.label}
        </a>
      ))}
      <button type='button' onClick={() => void more()} className={`${chip} border-line bg-sheet text-ink`}>
        <svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' style={{ flexShrink: 0 }}><path d='M7 17 17 7M9 7h8v8' /></svg> TikTok, Instagram &amp; more
      </button>
      <button type='button' onClick={() => void copy()} className={`${chip} border-line bg-sheet text-ink`} aria-live='polite'>
        <svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
          <path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1' />
          <path d='M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1' />
        </svg>
        Copy link
      </button>
      {note ? (
        <p role='status' className='w-full break-all text-xs text-dim'>
          {note}
        </p>
      ) : null}
    </div>
  );
}
