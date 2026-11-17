'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { storyForPath, storyShareText, storyShareUrl } from '@insuros/domain';
import { ACCENT_GRADIENT, Motif } from './motif';
import { ShareButton } from './share-button';

const HIDDEN_KEY = 'insuros.value.hidden';

// The folded banners, kept in this browser. Read through useSyncExternalStore
// so the server render and the first client render agree (nothing folded).
const listeners = new Set<() => void>();
let memory: string | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readRaw(): string {
  try {
    return window.localStorage.getItem(HIDDEN_KEY) ?? memory ?? '[]';
  } catch {
    return memory ?? '[]';
  }
}

const serverRaw = () => '[]';

function parseHidden(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeHidden(ids: string[]) {
  memory = JSON.stringify(ids);
  try {
    window.localStorage.setItem(HIDDEN_KEY, memory);
  } catch {
    // Private window or blocked storage: the choice lasts until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

/**
 * The section's value story, above every page: the problem, what this section
 * does about it, one thing to do now, and where the flow continues. It folds
 * to one line and remembers that per section on this device.
 */
export function ValueBanner({
  pathname,
  baseUrl,
  onUse
}: {
  pathname: string;
  baseUrl: string;
  /** Told which banner control was used, as `<story>><action or next link>`. */
  onUse?: (value: string) => void;
}) {
  const story = storyForPath(pathname);
  const raw = useSyncExternalStore(subscribe, readRaw, serverRaw);
  const hidden = useMemo(() => parseHidden(raw), [raw]);
  if (!story) return null;

  const folded = hidden.includes(story.id);
  const toggle = () => {
    const next = folded ? hidden.filter((id) => id !== story.id) : [...hidden, story.id];
    onUse?.(`${story.id}>${folded ? 'show' : 'hide'}`);
    writeHidden(next);
  };
  const shareUrl = storyShareUrl(story, baseUrl);

  if (folded) {
    return (
      <div className='mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-sheet/80 px-4 py-2.5 text-sm'>
        <p className='min-w-0 text-dim'>
          <span className='font-medium text-ink'>{story.area}.</span> {story.next[0].label} or {story.next[1].label.toLowerCase()} next.
        </p>
        <button
          type='button'
          onClick={toggle}
          className='rounded-lg px-2.5 py-1 font-medium text-seal transition hover:bg-sealsoft focus-visible:outline-2 focus-visible:outline-seal'
        >
          Why this matters
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label={`Why ${story.area.toLowerCase()} matters`}
      className='relative mb-7 overflow-hidden rounded-2xl text-white shadow-[0_18px_44px_-18px_rgba(18,28,49,0.55)]'
      style={{ backgroundImage: ACCENT_GRADIENT[story.accent] }}
    >
      <div aria-hidden='true' className='pointer-events-none absolute -right-4 -top-4 text-white/15 sm:right-6 sm:top-4'>
        <Motif motif={story.motif} size={150} />
      </div>
      <div className='relative p-5 sm:p-7'>
        <div className='flex items-start justify-between gap-3'>
          <p className='text-sm font-medium text-white/80'>{story.area}</p>
          <button
            type='button'
            onClick={toggle}
            aria-label='Fold this banner'
            className='-mr-1 -mt-1 rounded-lg px-2.5 py-1 text-sm text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white'
          >
            Hide
          </button>
        </div>

        <div className='mt-3 grid gap-4 md:grid-cols-2 md:gap-6'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-white/65'>The problem</p>
            <p className='mt-1.5 font-display text-[19px] leading-snug sm:text-[21px]'>{story.pain}</p>
          </div>
          <div className='min-w-0 rounded-xl bg-white/10 p-4 backdrop-blur-[1px]'>
            <p className='text-xs font-semibold text-white/65'>What you get here</p>
            <p className='mt-1.5 text-[15px] leading-relaxed text-white/95'>{story.answer}</p>
            <p className='mt-2.5 border-t border-white/15 pt-2.5 text-sm text-white/85'>
              <span className='font-semibold text-white'>Try it: </span>
              {story.doNow}
            </p>
          </div>
        </div>

        <div className='mt-5 flex flex-wrap items-center gap-2.5'>
          {story.next.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onUse?.(`${story.id}>${link.href}`)}
              className='inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] transition hover:-translate-y-px hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              {link.label}
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                <path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </Link>
          ))}
          <ShareButton title={`InsurOS: ${story.area}`} text={storyShareText(story, baseUrl)} url={shareUrl} onShare={() => onUse?.(`${story.id}>share`)} />
        </div>
      </div>
    </section>
  );
}
