'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation } from '@insuros/ui';
import { crumbsFor } from '@insuros/domain';
import { PAGE_ROUTES } from '@/lib/page-routes';
import { BackLink } from '@/components/back-link';

/** Menu names for the pages that have one, so breadcrumbs read like the menu. */
const LABELS: Record<string, string> = Object.fromEntries(
  adminNavigation.flatMap((section) => section.items.map((item) => [item.href, item.label]))
);
LABELS['/dashboard'] = 'Home';

/**
 * On every workspace page except Home (owner 24/11/26): "← Back", "Home" and
 * where you are (Home › Claims › CLM-2026-0001 › Settlement), each level a
 * link when it is a page. Nobody is left without a way back, including in
 * the Play app, which has no browser bar.
 */
export function WorkspaceNavBar() {
  const pathname = usePathname() ?? '/dashboard';
  if (pathname === '/dashboard') return null;
  const crumbs = crumbsFor(pathname, PAGE_ROUTES, LABELS);
  return (
    <nav aria-label='Where you are' className='mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm'>
      <BackLink home='/dashboard' />
      <Link href='/dashboard' className='rounded-lg px-2.5 py-1.5 font-medium text-ink hover:bg-ink/5 hover:text-seal'>
        Home
      </Link>
      <span aria-hidden='true' className='mx-1 h-4 w-px bg-line' />
      <ol className='flex min-w-0 flex-wrap items-center gap-x-1.5 text-dim'>
        {crumbs.slice(1).map((crumb, index, list) => {
          const last = index === list.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className='flex min-w-0 items-center gap-1.5'>
              {index > 0 ? <span aria-hidden='true'>›</span> : null}
              {crumb.href && !last ? (
                <Link href={crumb.href} className='truncate hover:text-seal hover:underline'>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={`truncate ${last ? 'font-medium text-ink' : ''}`}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
