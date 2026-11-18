'use client';

import { useState } from 'react';

/**
 * "Show a friend": the phone's own share sheet where there is one, else
 * WhatsApp and copy. Carries only the message and the join link.
 */
export function ShareCover({ text, link, words }: { text: string; link: string; words: { share: string; whatsapp: string; copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Cancelled or refused: the other buttons are still there.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
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
      <button type='button' onClick={share} className='rounded-lg bg-[#c9a227] px-4 py-2.5 text-sm font-semibold text-[#101c31] transition hover:bg-[#d8b13a]'>
        {words.share}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target='_blank' rel='noopener noreferrer' className='rounded-lg border border-ink/15 bg-sheet px-4 py-2.5 text-sm font-semibold text-ink hover:border-seal/50 hover:text-seal'>
        {words.whatsapp}
      </a>
      <button type='button' onClick={copy} className='rounded-lg px-3 py-2.5 text-sm font-medium text-seal underline underline-offset-2'>
        {copied ? words.copied : words.copy}
      </button>
    </div>
  );
}
