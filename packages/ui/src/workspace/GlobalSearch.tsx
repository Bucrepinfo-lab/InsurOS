"use client";

import { useMemo, useState } from 'react';
import type { NavLinkComponent } from '../navigation/SidebarNav';

export interface GlobalSearchProps {
  /** The sections this person may open. */
  items?: { label: string; href: string; group?: string }[];
  LinkComponent?: NavLinkComponent;
  /** Called when Enter picks the first match. */
  onNavigate?: (href: string) => void;
  /** Called when the person commits a search (Enter, or picking a result). */
  onSearch?: (query: string, found: boolean) => void;
}

/** Pure: sections whose name or group contains every word typed. */
export function matchSections<T extends { label: string; group?: string }>(items: T[], query: string, limit = 7): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items
    .filter((item) => {
      const text = `${item.label} ${item.group ?? ''}`.toLowerCase();
      return words.every((word) => text.includes(word));
    })
    .slice(0, limit);
}

/**
 * Jump to a section by name. (Records are searched inside each list, which
 * keeps that search inside the person's own records.)
 */
export function GlobalSearch({ items = [], LinkComponent, onNavigate, onSearch }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => matchSections(items, query), [items, query]);
  const Link = LinkComponent;

  return (
    <div className='relative w-full max-w-xl'>
      <label htmlFor='section-search' className='sr-only'>
        Go to a section
      </label>
      <input
        id='section-search'
        type='search'
        autoComplete='off'
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && query.trim() !== '') onSearch?.(query, Boolean(matches[0]));
          if (event.key === 'Enter' && matches[0]) {
            event.preventDefault();
            setQuery('');
            setOpen(false);
            if (onNavigate) onNavigate(matches[0].href);
            else window.location.assign(matches[0].href);
          }
          if (event.key === 'Escape') setOpen(false);
        }}
        className='h-10 w-full rounded-lg border border-line bg-paper/70 px-3 text-sm text-ink outline-none transition focus:border-seal focus:bg-sheet focus:ring-2 focus:ring-seal/20'
        placeholder='Go to a section — claims, tax, commissions…'
      />
      {open && query.trim() !== '' ? (
        <ul className='absolute inset-x-0 top-11 z-30 overflow-hidden rounded-xl border border-line bg-sheet shadow-[0_18px_44px_-18px_rgba(18,28,49,0.35)]'>
          {matches.length === 0 ? (
            <li className='px-3 py-2.5 text-sm text-dim'>No section with that name. Try “claims” or “tax”.</li>
          ) : (
            matches.map((item) => {
              const body = (
                <>
                  <span className='font-medium text-ink'>{item.label}</span>
                  {item.group ? <span className='ml-2 text-xs text-faint'>{item.group}</span> : null}
                </>
              );
              const className = 'block px-3 py-2.5 text-sm transition hover:bg-sealsoft/60 focus-visible:bg-sealsoft/60 focus-visible:outline-none';
              return (
                <li key={item.href}>
                  {Link ? (
                    <Link href={item.href} className={className} onClick={() => {
                        onSearch?.(query, true);
                        setQuery('');
                      }}
                    >
                      {body}
                    </Link>
                  ) : (
                    <a href={item.href} className={className}>
                      {body}
                    </a>
                  )}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
