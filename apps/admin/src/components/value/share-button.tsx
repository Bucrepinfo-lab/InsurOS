'use client';

import { useState } from 'react';
import { COPIED_HINT, shareTargets } from '@insuros/domain';

/**
 * Share where people actually are (owner 26/11/26): WhatsApp and Facebook
 * first, then X, Telegram, LinkedIn, SMS and email, plus copy and "TikTok,
 * Instagram & more". On a phone, "Share this" opens the phone's own share
 * sheet; on a computer it opens this menu (never the computer's OneNote /
 * Outlook box). A PRIVATE link (someone's own policies or conversation) is
 * only offered WhatsApp, SMS and email — never Facebook, X or LinkedIn.
 */
export function ShareButton({
  title,
  text,
  url,
  tone = 'light',
  privateLink = false,
  onShare
}: {
  title: string;
  text: string;
  url: string;
  tone?: 'light' | 'dark';
  /** Someone's own page: one-to-one channels only. */
  privateLink?: boolean;
  /** Called when the person presses Share. */
  onShare?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const button =
    tone === 'light'
      ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
      : 'border-ink/15 bg-sheet text-ink hover:border-seal/50 hover:text-seal focus-visible:outline-seal';

  function phoneSheet(): boolean {
    const touch = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    return touch && typeof navigator.share === 'function';
  }

  async function share() {
    onShare?.();
    if (phoneSheet()) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Closed the sheet: fall through to the menu.
      }
    }
    setOpen((value) => !value);
  }

  async function copy(hint: string) {
    try {
      await navigator.clipboard.writeText(text.includes(url) ? text : `${text} ${url}`);
      setNote(hint);
      setTimeout(() => setNote(''), 4000);
    } catch {
      setNote('');
    }
  }

  const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink transition hover:bg-sealsoft/70 focus-visible:bg-sealsoft/70 focus-visible:outline-none';

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
        <div className='absolute right-0 z-30 mt-2 w-64 rounded-xl border border-line bg-sheet p-1.5 shadow-[0_18px_44px_-18px_rgba(18,28,49,0.4)]'>
          {shareTargets({ text, url, title }, { privateLink }).map((target) => (
            <a key={target.id} className={item} href={target.href} target={target.href.startsWith('http') ? '_blank' : undefined} rel='noopener noreferrer'>
              <span aria-hidden='true' className='inline-block h-2.5 w-2.5 rounded-full' style={{ background: target.color }} />
              {target.label}
            </a>
          ))}
          {privateLink ? null : (
            <button type='button' className={item} onClick={() => void copy(COPIED_HINT)}>
              TikTok, Instagram &amp; more
            </button>
          )}
          <button type='button' className={item} onClick={() => void copy('Copied')}>
            Copy text and link
          </button>
          {note ? <p role='status' className='px-3 pb-1 text-xs text-seal'>{note}</p> : null}
          <p className='select-all break-all px-3 pb-2 pt-1 font-mono text-[11px] text-dim'>{url}</p>
        </div>
      ) : null}
    </div>
  );
}
