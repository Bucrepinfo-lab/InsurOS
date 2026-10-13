"use client";

import type { ReactNode } from 'react';
import { TenantContext, type PlatformTenant } from './TenantContext';

export interface TenantProviderProps {
  children: ReactNode;
  tenant?: PlatformTenant;
}

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={tenant ?? { name: 'InsurOS Internal' }}>
      {children}
    </TenantContext.Provider>
  );
}

