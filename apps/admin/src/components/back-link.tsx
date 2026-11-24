'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { parentPage, previousPage, recordVisit } from '@insuros/domain';
import { PAGE_ROUTES } from '@/lib/page-routes';

/**
 * The way back from any page (owner 24/11/26). The trail of pages visited in
 * this tab lives in sessionStorage (this tab only; cleared when it closes).
 * Storage can be refused (private mode); everything still works without it,
 * "Back" then goes to the page above.
 */
const KEY = 'insuros_trail';

function readTrail(): string[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeTrail(trail: string[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(trail));
  } catch {
    // Storage refused: Back falls back to the page above.
  }
}

/** Put once in the root layout: notes every page opened in this tab. */
export function TrailRecorder() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) writeTrail(recordVisit(readTrail(), pathname));
  }, [pathname]);
  return null;
}

/**
 * "← Back": the previous InsurOS page of this visit, or, when this page is
 * where the visit began, `fallback` (default: the page above this one).
 */
export function BackLink({
  label = 'Back',
  fallback,
  home = '/',
  className = 'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 hover:text-seal'
}: {
  label?: string;
  fallback?: string;
  home?: string;
  className?: string;
}) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const above = fallback ?? parentPage(pathname, PAGE_ROUTES, home);
  return (
    <Link
      href={above}
      className={className}
      onClick={(event) => {
        if (previousPage(readTrail(), pathname)) {
          event.preventDefault();
          router.back();
        }
      }}
    >
      <span aria-hidden='true'>←</span> {label}
    </Link>
  );
}
