"use client";

import { useState, type ReactNode } from 'react';
import { WorkspaceLayout } from '../layouts';
import { SidebarNav, adminNavigation } from '../navigation';
import { useEnvironment, useTenant, useUser } from '../platform';
import {
  EnvironmentBadge,
  GlobalSearch,
  NotificationBell,
  TenantSwitcher,
  UserMenu,
  WorkspaceTopbar
} from './index';

const navItems = adminNavigation.flatMap((section) => section.items).map((item) => ({
  label: item.label,
  href: item.href,
  isActive: item.id === 'dashboard'
}));

export interface AdminWorkspaceShellProps {
  children: ReactNode;
  notificationCount?: number;
}

export function AdminWorkspaceShell({
  children,
  notificationCount = 0
}: AdminWorkspaceShellProps) {
  const tenant = useTenant();
  const environment = useEnvironment();
  const user = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <WorkspaceLayout
        sidebar={<SidebarNav title='InsurOS' items={navItems} />}
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
            center={<GlobalSearch />}
            right={
              <>
                <EnvironmentBadge environment={environment} />
                <NotificationBell count={notificationCount} />
                <UserMenu name={user.name} email={user.email} />
              </>
            }
          />
        }
      >
        {children}
      </WorkspaceLayout>

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
            <div onClick={() => setMenuOpen(false)}>
              <SidebarNav title='InsurOS' items={navItems} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
