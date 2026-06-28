"use client";

import type { ReactNode } from 'react';
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

  return (
    <WorkspaceLayout
      sidebar={<SidebarNav title='InsurOS Admin' items={navItems} />}
      topbar={
        <WorkspaceTopbar
          left={<TenantSwitcher tenantName={tenant.name} environment={environment} />}
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
  );
}

