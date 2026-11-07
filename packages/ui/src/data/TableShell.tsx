'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { downloadCsv, toCsv } from './ExportCsvButton';

export interface TableShellExport {
  filename: string;
  headers: string[];
  /** One entry per table row, in the same order as the rendered rows. */
  rows: string[][];
}

export interface TableShellProps {
  searchPlaceholder?: string;
  actions?: ReactNode;
  children: ReactNode;
  perPage?: number;
  /** URL search param that holds this list's search text (kept in the URL). */
  searchParam?: string;
  /** The search text the server already applied (from the URL). */
  initialQuery?: string;
  /** Extra filter controls (e.g. a status select) submitted with the search. */
  filters?: ReactNode;
  /** When set, "Export CSV" downloads exactly the rows the search matches. */
  exportCsv?: TableShellExport;
}

function readUrlParam(name: string): string {
  try {
    return new URLSearchParams(window.location.search).get(name) ?? '';
  } catch {
    return '';
  }
}

function writeUrlParam(name: string, value: string): void {
  try {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
    window.history.replaceState(window.history.state, '', url);
  } catch {
    // URL sync is a convenience; filtering still works without it.
  }
}

/**
 * Client shell that makes any server-rendered table live: typing filters rows
 * by their visible text, and pagination pages through matches. The search text
 * lives in the URL (`?<searchParam>=`), so a refresh or a shared link keeps it,
 * and pressing Enter / Apply sends it to the server, which filters the rows,
 * summary cards and export the same way. The table stays a server component
 * passed as children.
 */
export function TableShell({
  searchPlaceholder = 'Search...',
  actions,
  children,
  perPage = 10,
  searchParam = 'q',
  initialQuery,
  filters,
  exportCsv
}: TableShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [page, setPage] = useState(1);
  const [matches, setMatches] = useState(0);
  const [matchingIndexes, setMatchingIndexes] = useState<number[]>([]);

  // Pick up a search kept in the URL when the server did not apply it.
  useEffect(() => {
    if (initialQuery === undefined) {
      const fromUrl = readUrlParam(searchParam);
      if (fromUrl) setQuery(fromUrl);
    }
  }, [initialQuery, searchParam]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('tbody tr'));
    const q = query.trim().toLowerCase();

    const matching: number[] = [];
    rows.forEach((row, index) => {
      if (!q || (row.textContent ?? '').toLowerCase().includes(q)) matching.push(index);
    });

    const totalPages = Math.max(1, Math.ceil(matching.length / perPage));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * perPage;
    const visible = new Set(matching.slice(start, start + perPage));

    rows.forEach((row, index) => {
      (row as HTMLElement).style.display = visible.has(index) ? '' : 'none';
    });

    setMatches(matching.length);
    setMatchingIndexes(matching);
    if (current !== page) setPage(current);
  }, [query, page, perPage, children]);

  const totalPages = Math.max(1, Math.ceil(matches / perPage));

  const handleExport = () => {
    if (!exportCsv) return;
    const rows = matchingIndexes
      .map((index) => exportCsv.rows[index])
      .filter((row): row is string[] => Array.isArray(row));
    downloadCsv(exportCsv.filename, toCsv(exportCsv.headers, rows));
  };

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 rounded-xl border border-line bg-sheet p-4 shadow-[0_1px_2px_rgba(18,28,49,0.04)] md:flex-row md:items-center md:justify-between'>
        <form method='get' role='search' className='flex w-full flex-col gap-2 md:max-w-xl md:flex-row md:items-center'>
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
              name={searchParam}
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                writeUrlParam(searchParam, event.target.value.trim());
              }}
              className='w-full rounded-lg border border-line bg-paper/60 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/20'
            />
          </div>
          {filters ? (
            <div className='flex flex-wrap items-center gap-2'>
              {filters}
              <button
                type='submit'
                className='rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink transition hover:border-seal/50 hover:text-seal'
              >
                Apply
              </button>
            </div>
          ) : null}
        </form>
        {actions || exportCsv ? (
          <div className='flex shrink-0 items-center gap-2'>
            {actions}
            {exportCsv ? (
              <button
                type='button'
                onClick={handleExport}
                className='inline-flex items-center justify-center rounded-lg border border-ink/15 bg-sheet/60 px-4 py-2 text-sm font-medium text-ink transition-all duration-200 hover:-translate-y-px hover:border-seal/50 hover:text-seal'
              >
                Export CSV
              </button>
            ) : null}
          </div>
        ) : null}
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
