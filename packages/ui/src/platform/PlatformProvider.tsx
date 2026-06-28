"use client";

import type { ReactNode } from 'react';
import { EnvironmentProvider, type PlatformEnvironment } from './environment';
import { PermissionProvider } from './permissions';
import { TenantProvider, type PlatformTenant } from './tenant';
import { UserProvider, type PlatformUser } from './user';

export interface PlatformProviderProps {
  children: ReactNode;
  user?: PlatformUser;
  tenant?: PlatformTenant;
  permissions?: string[];
  environment?: PlatformEnvironment;
}

export function PlatformProvider({
  children,
  user,
  tenant,
  permissions,
  environment
}: PlatformProviderProps) {
  return (
    <EnvironmentProvider environment={environment}>
      <PermissionProvider permissions={permissions}>
        <TenantProvider tenant={tenant}>
          <UserProvider user={user}>{children}</UserProvider>
        </TenantProvider>
      </PermissionProvider>
    </EnvironmentProvider>
  );
}

