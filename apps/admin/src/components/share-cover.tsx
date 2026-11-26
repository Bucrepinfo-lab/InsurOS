'use client';

import { useEffect, useState } from 'react';
import { shareTargets } from '@insuros/domain';

/**
 * "Show a friend" (a public join link, owner 26/11/26): WhatsApp first, then
 * Facebook, X, Telegram, LinkedIn, SMS and email, copy link, and on a phone
 * the phone's own share sheet (TikTok, Instagram and the rest). Carries only
 * the message and the join link.
 */
export function ShareCover({ text, link, words }: { text: string; link: string; words: { share: string; whatsapp: string; copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  const [phoneSheet, setPhoneSheet] = useState(false);
  useEffect(() => {
    const touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the browser after mount
    setPhoneSheet(touch && typeof navigator.share === 'function');
  }, []);
  const share = async () => {
    try {
      await navigator.share({ text });
    } catch {
      // Cancelled or refused: the other buttons are still there.
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {shareTargets({ text, url: link }).map((target) => (
        <a
          key={target.id}
          href={target.href}
          target={target.href.startsWith('http') ? '_blank' : undefined}
          rel='noopener noreferrer'
          className='rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
          style={{ background: target.color }}
        >
          {target.id === 'whatsapp' ? words.whatsapp : target.label}
        </a>
      ))}
      {phoneSheet ? (
        <button type='button' onClick={share} className='rounded-lg bg-[#c9a227] px-4 py-2.5 text-sm font-semibold text-[#101c31] transition hover:bg-[#d8b13a]'>
          {words.share}
        </button>
      ) : null}
      <button type='button' onClick={copy} className='rounded-lg px-3 py-2.5 text-sm font-medium text-seal underline underline-offset-2'>
        {copied ? words.copied : words.copy}
      </button>
    </div>
  );
}
