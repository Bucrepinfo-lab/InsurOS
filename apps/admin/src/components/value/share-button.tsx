'use client';

import { useState } from 'react';

/**
 * Share a value story: the phone's own share sheet where there is one,
 * otherwise WhatsApp, email and copy. The link is the public /why page, so
 * the person receiving it needs no sign-in.
 */
export function ShareButton({
  title,
  text,
  url,
  tone = 'light'
}: {
  title: string;
  text: string;
  url: string;
  tone?: 'light' | 'dark';
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const button =
    tone === 'light'
      ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
      : 'border-ink/15 bg-sheet text-ink hover:border-seal/50 hover:text-seal focus-visible:outline-seal';

  async function share() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Closed the sheet, or sharing is blocked here: fall through to the menu.
      }
    }
    setOpen((value) => !value);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const item = 'block w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition hover:bg-sealsoft/70 focus-visible:bg-sealsoft/70 focus-visible:outline-none';

  return (
    <div className='relative inline-block'>
      <button
        type='button'
        onClick={share}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 ${button}`}
      >
        <svg width='15' height='15' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M8 12l8-5M8 12l8 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
          <circle cx='6' cy='12' r='2.5' stroke='currentColor' strokeWidth='1.8' />
          <circle cx='18' cy='6' r='2.5' stroke='currentColor' strokeWidth='1.8' />
          <circle cx='18' cy='18' r='2.5' stroke='currentColor' strokeWidth='1.8' />
        </svg>
        Share this
      </button>
      {open ? (
        <div className='absolute right-0 z-30 mt-2 w-60 rounded-xl border border-line bg-sheet p-1.5 shadow-[0_18px_44px_-18px_rgba(18,28,49,0.4)]'>
          <a className={item} href={`https://wa.me/?text=${encodeURIComponent(text)}`} target='_blank' rel='noopener noreferrer'>
            Send on WhatsApp
          </a>
          <a className={item} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`}>
            Send by email
          </a>
          <button type='button' className={item} onClick={copy}>
            {copied ? 'Copied' : 'Copy text and link'}
          </button>
          <p className='select-all break-all px-3 pb-2 pt-1 font-mono text-[11px] text-dim'>{url}</p>
        </div>
      ) : null}
    </div>
  );
}
