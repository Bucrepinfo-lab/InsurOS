'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AdminWorkspaceShell } from '@insuros/ui';
import { ValueBanner } from '@/components/value/value-banner';
import { track } from '@/lib/usage';

/**
 * The workspace shell wired to the router: the menu marks the current
 * section, links move without reloading the page, the search jumps to a
 * section, and each section opens with its value story.
 */
export function DashboardShell({
  children,
  userActions,
  baseUrl
}: {
  children: ReactNode;
  userActions?: ReactNode;
  baseUrl: string;
}) {
  const pathname = usePathname() ?? '/dashboard';
  const router = useRouter();
  // Count the section opened (the section only, never a record id).
  useEffect(() => track('section', pathname), [pathname]);
  return (
    <AdminWorkspaceShell
      userActions={userActions}
      pathname={pathname}
      LinkComponent={Link}
      onNavigate={(href) => router.push(href)}
      onSearch={(query, found) => track(found ? 'search' : 'search-miss', query)}
      banner={<ValueBanner pathname={pathname} baseUrl={baseUrl} onUse={(value) => track('click', value)} />}
    >
      {children}
    </AdminWorkspaceShell>
  );
}
