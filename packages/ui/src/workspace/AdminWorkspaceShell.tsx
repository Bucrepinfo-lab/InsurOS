"use client";

import { useState, type ReactNode } from 'react';
import { PhoneTabBar, phoneTabs } from './PhoneTabBar';
import { WorkspaceLayout } from '../layouts';
import { NavIcon, SidebarNav, adminNavigation, filterNavigationByPermissions, type NavLinkComponent } from '../navigation';
import { useEnvironment, usePermissions, useTenant, useUser } from '../platform';
import {
  EnvironmentBadge,
  GlobalSearch,
  NotificationBell,
  TenantSwitcher,
  UserMenu,
  WorkspaceTopbar
} from './index';

export interface AdminWorkspaceShellProps {
  children: ReactNode;
  notificationCount?: number;
  /** Extra controls beside the user (e.g. sign out). */
  userActions?: ReactNode;
  /** Current path, so the menu marks where you are. */
  pathname?: string;
  /** The app's router link, so moving between sections does not reload the page. */
  LinkComponent?: NavLinkComponent;
  /** Router push, used by the section search on Enter. */
  onNavigate?: (href: string) => void;
  /** Told what was typed in the section search and whether a section matched. */
  onSearch?: (query: string, found: boolean) => void;
  /** Rendered above every page (the section's value story). */
  banner?: ReactNode;
}

/** Pure: the menu item for a path is the one with the longest matching href. */
export function activeHref(hrefs: string[], pathname: string): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (!best || href.length > best.length)) best = href;
  }
  return best;
}

export function AdminWorkspaceShell({
  children,
  notificationCount = 0,
  userActions,
  pathname = '/dashboard',
  LinkComponent,
  onNavigate,
  onSearch,
  banner
}: AdminWorkspaceShellProps) {
  const tenant = useTenant();
  const environment = useEnvironment();
  const user = useUser();
  const { permissions } = usePermissions();
  const [menuOpen, setMenuOpen] = useState(false);

  // Menus mirror the server-side permission checks (they never replace them).
  const sections = filterNavigationByPermissions(adminNavigation, { permissions });
  const current = activeHref(sections.flatMap((section) => section.items.map((item) => item.href)), pathname);
  const navGroups = sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      label: item.label,
      href: item.href,
      icon: <NavIcon id={item.id} />,
      isActive: item.href === current
    }))
  }));
  const searchItems = sections.flatMap((section) =>
    section.items.map((item) => ({ label: item.label, href: item.href, group: section.title }))
  );
  const quickTabs = phoneTabs(sections.flatMap((section) => section.items));
  const canSeeNotifications = searchItems.some((item) => item.href === '/dashboard/notifications');

  return (
    <>
      <WorkspaceLayout
        sidebar={<SidebarNav title='InsurOS' groups={navGroups} LinkComponent={LinkComponent} />}
        topbar={
          <WorkspaceTopbar
            left={
              <>
                <button
                  type='button'
                  aria-label='Open navigation'
                  onClick={() => setMenuOpen(true)}
                  className='-ml-1 mr-1 rounded-lg p-2 text-ink transition hover:bg-ink/5 lg:hidden'
                >
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                    <path d='M4 7h16M4 12h16M4 17h16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                  </svg>
                </button>
                <TenantSwitcher tenantName={tenant.name} environment={environment} />
              </>
            }
            center={<GlobalSearch items={searchItems} LinkComponent={LinkComponent} onNavigate={onNavigate} onSearch={onSearch} />}
            right={
              <>
                <span className='hidden sm:inline-flex'>
                  <EnvironmentBadge environment={environment} />
                </span>
                <NotificationBell
                  count={notificationCount}
                  href={canSeeNotifications ? '/dashboard/notifications' : undefined}
                  LinkComponent={LinkComponent}
                />
                <UserMenu name={user.name} email={user.email} actions={userActions} />
              </>
            }
          />
        }
      >
        {banner}
        {children}
        {/* Room under the last card for the phone tab bar. */}
        <div aria-hidden='true' className='h-24 lg:hidden' />
      </WorkspaceLayout>

      <PhoneTabBar tabs={quickTabs} currentHref={current} onOpenMenu={() => setMenuOpen(true)} LinkComponent={LinkComponent} />

      {menuOpen ? (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <button
            type='button'
            aria-label='Close navigation'
            onClick={() => setMenuOpen(false)}
            className='absolute inset-0 bg-inkdeep/60 backdrop-blur-[2px]'
          />
          <div
            className='animate-rise absolute inset-y-0 left-0 w-72 overflow-y-auto shadow-2xl'
            style={{
              backgroundImage:
                'linear-gradient(168deg, #17253f 0%, #101c31 58%, #0b1526 100%)'
            }}
          >
            <div className='flex justify-end p-2'>
              <button
                type='button'
                aria-label='Close navigation'
                onClick={() => setMenuOpen(false)}
                className='rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white'
              >
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                  <path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                </svg>
              </button>
            </div>
            <SidebarNav
              title='InsurOS'
              groups={navGroups}
              LinkComponent={LinkComponent}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
