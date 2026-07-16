'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface TableShellProps {
  searchPlaceholder?: string;
  actions?: ReactNode;
  children: ReactNode;
  perPage?: number;
}

/**
 * Client shell that makes any server-rendered table live: typing filters
 * rows by their visible text, and pagination pages through matches. The
 * table itself stays a server component passed as children.
 */
export function TableShell({
  searchPlaceholder = 'Search...',
  actions,
  children,
  perPage = 10
}: TableShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('tbody tr'));
    const q = query.trim().toLowerCase();

    const matching = rows.filter((row) => {
      const hit = !q || (row.textContent ?? '').toLowerCase().includes(q);
      return hit;
    });

    const totalPages = Math.max(1, Math.ceil(matching.length / perPage));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * perPage;
    const visible = new Set(matching.slice(start, start + perPage));

    rows.forEach((row) => {
      (row as HTMLElement).style.display = visible.has(row) ? '' : 'none';
    });

    setMatches(matching.length);
    if (current !== page) setPage(current);
  }, [query, page, perPage, children]);

  const totalPages = Math.max(1, Math.ceil(matches / perPage));

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 rounded-xl border border-line bg-sheet p-4 shadow-[0_1px_2px_rgba(18,28,49,0.04)] md:flex-row md:items-center md:justify-between'>
        <div className='relative w-full md:max-w-sm'>
          <svg
            aria-hidden='true'
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint'
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill='none'
          >
            <circle cx='11' cy='11' r='7' stroke='currentColor' strokeWidth='2' />
            <path d='m20 20-3.5-3.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
          </svg>
          <input
            type='search'
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className='w-full rounded-lg border border-line bg-paper/60 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/20'
          />
        </div>
        {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
      </div>

      <div ref={containerRef}>{children}</div>

      <div className='mt-3 flex flex-col gap-3 px-1 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-dim'>
          {query
            ? `${matches} match${matches === 1 ? '' : 'es'} · page ${Math.min(page, totalPages)} of ${totalPages}`
            : `${matches} records · page ${Math.min(page, totalPages)} of ${totalPages}`}
        </p>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1}
            className='rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink transition hover:border-seal/50 hover:text-seal disabled:cursor-not-allowed disabled:opacity-40'
          >
            Previous
          </button>
          <button
            type='button'
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages}
            className='rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink transition hover:border-seal/50 hover:text-seal disabled:cursor-not-allowed disabled:opacity-40'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
